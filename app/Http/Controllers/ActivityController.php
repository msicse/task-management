<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $currentUser = auth()->user();

        // Check SITE PERMISSIONS (what user CAN do)
        if (!$currentUser->can('activity-list') && !$currentUser->can('activity-list-all')) {
            abort(403, 'Unauthorized to view activities.');
        }

        $query = Activity::with(['user', 'activityCategory', 'files', 'sessions']);

        // Apply permission-based filtering (SITE PERMISSIONS)
        if (!$currentUser->can('activity-list-all')) {
            // User can only see their own activities
            $query->where('user_id', $currentUser->id);
        } else {
            // User can see all activities, but filter by ASSIGNED CATEGORIES if needed
            $assignedCategories = $currentUser->getAssignedActivityCategories();
            if ($assignedCategories->isNotEmpty()) {
                // Optionally filter by assigned categories
                // $query->whereIn('activity_category_id', $assignedCategories->pluck('id'));
            }
        }

        // Filter by user if provided (only for users with activity-list-all permission)
        if ($request->has('user_id') && $currentUser->can('activity-list-all')) {
            $query->byUser($request->user_id);
        }

        // Filter by category if provided
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('started_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('started_at', '<=', $request->end_date);
        }

        $activities = $query->latest()->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($activities);
        }

        // Get all categories (main and sub) for select
        $categories = ActivityCategory::orderBy('name')->get(['id', 'name', 'parent_id']);

        // Also get categories assigned to current user's work roles so the UI can
        // restrict selectable sub-categories to only those the user has access to.
        $assignedCategories = $currentUser->getAssignedActivityCategories()->pluck('id');

        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'categories' => $categories,
            'assignedCategories' => $assignedCategories,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'user_id', 'category_id']),
            'permissions' => [
                'canSeeAllActivities' => $currentUser->can('activity-list-all'),
                'canSeeOwnActivities' => $currentUser->can('activity-list'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // Get categories applicable to current user's roles
        $categories = auth()->user()->getApplicableActivityCategories();

        return Inertia::render('Activities/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'activity_category_id' => 'required|exists:activity_categories,id',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:started,paused,completed',
            'files.*' => 'nullable|file|max:10240', // 10MB max per file
            'redirect_to' => 'nullable|string|in:dashboard,activities',
        ]);

        // Verify user can access this category
        $category = ActivityCategory::find($validated['activity_category_id']);
        if (!auth()->user()->canAccessActivityCategory($category->name)) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You do not have access to this category.'], 403);
            }
            return back()->withErrors(['activity_category_id' => 'You do not have access to this category.']);
        }

        $validated['user_id'] = auth()->id();

        // Create the activity first
        $activity = Activity::create($validated);

        // Handle file uploads if any
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                // Additional validation for each file
                if ($file->isValid()) {
                    $path = $file->store('activity-files', 'public');

                    $activity->files()->create([
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);
                }
            }
        }

        // If status is 'started', use the startActivityExclusive method to pause others and start this one
        if ($validated['status'] === 'started') {
            $activity->startActivityExclusive();
        }

        if ($request->wantsJson()) {
            return response()->json($activity->load(['user', 'activityCategory', 'files']), 201);
        }

        // Check if redirect_to parameter is provided
        $redirectTo = $request->input('redirect_to', 'activities');

        if ($redirectTo === 'dashboard') {
            return redirect()->route('dashboard')
                ->with('success', 'Activity created successfully' . ($request->hasFile('files') ? ' with files' : '') . '.');
        }

        return redirect()->route('activities.index')
            ->with('success', 'Activity created successfully' . ($request->hasFile('files') ? ' with files' : '') . '.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity): Response|JsonResponse
    {
        $activity->load([
            'user',
            'activityCategory',
            'files',
            'sessions' => function ($query) {
                $query->orderBy('started_at', 'desc');
            }
        ]);

        if (request()->wantsJson()) {
            return response()->json($activity);
        }

        return Inertia::render('Activities/Show', [
            'activity' => $activity
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Activity $activity): Response
    {
        // Load activity with its relationships
        $activity->load(['activityCategory', 'files', 'user']);

        // Get categories applicable to current user's roles
        $categories = auth()->user()->getApplicableActivityCategories();

        return Inertia::render('Activities/Edit', [
            'activity' => $activity,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Activity $activity): RedirectResponse|JsonResponse
    {
        // Debug: Log request data
        \Log::info('Activity Update Request:', [
            'method' => $request->method(),
            'has_files' => $request->hasFile('files'),
            'files_count' => $request->hasFile('files') ? count($request->file('files')) : 0,
            'all_data' => $request->all()
        ]);

        $validated = $request->validate([
            'activity_category_id' => 'required|exists:activity_categories,id',
            'description' => 'nullable|string|max:1000',
            'count' => 'nullable|integer|min:0',
            'files.*' => 'nullable|file|max:10240', // 10MB max per file
        ]);

        // Update only the validated fields (including count if provided)
        $activity->update(array_filter($validated, function ($value, $key) {
            return in_array($key, ['activity_category_id', 'description', 'count']);
        }, ARRAY_FILTER_USE_BOTH));

        // Handle file uploads if any
        if ($request->hasFile('files')) {
            \Log::info('Processing file uploads for activity:', ['activity_id' => $activity->id]);
            $fileIndex = 0;
            foreach ($request->file('files') as $file) {
                // Additional validation for each file
                if ($file->isValid()) {
                    $path = $file->store('activity-files', 'public');
                    \Log::info("File stored: {$file->getClientOriginalName()} at {$path}");

                    $activityFile = $activity->files()->create([
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);

                    \Log::info('ActivityFile created:', ['id' => $activityFile->id]);
                } else {
                    \Log::error("Invalid file at index {$fileIndex}: " . $file->getErrorMessage());
                }
                $fileIndex++;
            }
        } else {
            \Log::info('No files in request');
        }

        if ($request->wantsJson()) {
            return response()->json($activity->load(['user', 'activityCategory', 'files']));
        }

        return redirect()->route('activities.show', $activity)
            ->with('success', 'Activity updated successfully' . ($request->hasFile('files') ? ' with new files' : '') . '.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity): RedirectResponse|JsonResponse
    {
        $activity->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Activity deleted successfully.']);
        }

        return redirect()->route('activities.index');
    }

    /**
     * Start an activity (set status to started and record start time)
     */
    public function start(Activity $activity): JsonResponse|RedirectResponse
    {
        try {
            $activity->startActivityExclusive();

            if (request()->wantsJson()) {
                return response()->json($activity->fresh(['sessions', 'activityCategory', 'files']));
            }

            return back()->with('success', 'Activity started successfully.');
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['error' => 'Failed to start activity: ' . $e->getMessage()], 500);
            }

            return back()->with('error', 'Failed to start activity.');
        }
    }

    /**
     * Pause an activity
     */
    public function pause(Activity $activity): JsonResponse|RedirectResponse
    {
        try {
            $activity->pauseActivity();

            if (request()->wantsJson()) {
                return response()->json($activity->fresh(['sessions', 'activityCategory', 'files']));
            }

            return back()->with('success', 'Activity paused successfully.');
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['error' => 'Failed to pause activity: ' . $e->getMessage()], 500);
            }

            return back()->with('error', 'Failed to pause activity.');
        }
    }

    /**
     * Complete an activity (set status to completed and record end time)
     */
    public function complete(Activity $activity): JsonResponse|RedirectResponse
    {
        try {
            // Debug logging: record incoming request details to help trace file/count issues
            $reqAll = request()->all();
            $filesCandidate = request()->file('files') ?? request()->file('files[]') ?? [];
            $filesCount = is_countable($filesCandidate) ? count($filesCandidate) : 0;

            \Log::info('Activity complete called', [
                'activity_id' => $activity->id,
                'user_id' => auth()->id(),
                'request_keys' => array_keys($reqAll),
                'count_value' => request('count'),
                'has_files' => request()->hasFile('files') || request()->hasFile('files[]'),
                'files_count' => $filesCount,
            ]);

            $activity->completeActivity();

            // Update count field if provided (after completion to avoid overwrite)
            if (request()->has('count')) {
                $activity->count = request('count');
                $activity->save();
            }

            // Handle file uploads if any (after completion)
            $uploadedFiles = request()->file('files') ?? request()->file('files[]') ?? [];
            if (is_countable($uploadedFiles) && count($uploadedFiles) > 0) {
                foreach ($uploadedFiles as $file) {
                    if ($file && method_exists($file, 'isValid') && $file->isValid()) {
                        $path = $file->store('activity-files', 'public');
                        $activity->files()->create([
                            'file_path' => $path,
                            'original_name' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                        ]);
                    }
                }
            }

            if (request()->wantsJson()) {
                return response()->json($activity->fresh(['sessions', 'activityCategory', 'files']));
            }

            return back()->with('success', 'Activity completed successfully.');
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return response()->json(['error' => 'Failed to complete activity: ' . $e->getMessage()], 500);
            }

            return back()->with('error', 'Failed to complete activity.');
        }
    }
}
