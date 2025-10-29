<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $currentUser = auth()->user();

        // Build base query
        $query = Activity::with(['user', 'activityCategory', 'files', 'sessions']);

        // Scope activities based on permissions:
        // - If the current user has 'activity-list-all', they may view all activities.
        //   If a specific user_id is provided, filter to that user; otherwise leave unfiltered
        //   so they see activities across users.
        // - If the current user lacks that permission, always restrict to their own activities.
        if ($currentUser->can('activity-list-all')) {
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
        } else {
            // Non-privileged users always see only their own activities
            $query->where('user_id', $currentUser->id);
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

        // Allow client to control per-page via `per_page` query parameter.
        // Default to 15 and enforce reasonable bounds to avoid excessive memory use.
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }
        // Cap per-page to a safe maximum (e.g. 10000) when 'All' is requested via large numbers
        $perPage = min($perPage, 10000);

        $activities = $query->latest()->paginate($perPage)->appends($request->all());

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
                'canImportActivities' => $currentUser->can('activity-import'),
            ]
        ]);
    }

    /**
     * Show import form for activities
     */
    public function importForm()
    {
        // Server-side permission check - redirect with flash for web UX
        if (! auth()->user() || ! auth()->user()->can('activity-import')) {
            return redirect()->route('activities.index')->with('error', 'You are not authorized to access activity imports.');
        }

        return Inertia::render('Activities/Import', [
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Handle import upload for activities (basic/optional importer)
     */
    public function import(Request $request)
    {
        // Server-side permission check - redirect with flash for web UX
        if (! auth()->user() || ! auth()->user()->can('activity-import')) {
            return redirect()->route('activities.index')->with('error', 'You are not authorized to import activities.');
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // If a dedicated importer exists, attempt to run it
            if (class_exists('\App\\Imports\\ActivityImport')) {
                $className = '\\App\\Imports\\ActivityImport';
                $importClass = new $className();
                Excel::import($importClass, $request->file('file'));
                return redirect()->route('activities.index')->with('success', 'Import completed successfully.');
            }

            // Otherwise store the uploaded file for manual processing and inform the user
            $path = $request->file('file')->store('imports/activities');
            return redirect()->route('activities.index')->with('success', 'File uploaded to storage/' . $path . '. No automatic importer is registered.');
        } catch (\Exception $e) {
            return redirect()->route('activities.index')->with('error', 'Import failed: ' . $e->getMessage());
        }
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
    public function edit(Activity $activity): Response|\Illuminate\Http\RedirectResponse
    {
        // Load activity with its relationships
        $activity->load(['activityCategory', 'files', 'user']);

        $this->authorize('update', $activity);

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

        $this->authorize('update', $activity);

        $validated = $request->validate([
            'activity_category_id' => 'required|exists:activity_categories,id',
            'description' => 'nullable|string|max:1000',
            'count' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:2000',
            'files.*' => 'nullable|file|max:10240', // 10MB max per file
        ]);

        // Update only the validated fields (including count if provided)
        $activity->update(array_filter($validated, function ($value, $key) {
            return in_array($key, ['activity_category_id', 'description', 'count', 'notes']);
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
        $this->authorize('delete', $activity);

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
            $this->authorize('operate', $activity);
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
            $this->authorize('operate', $activity);
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
            $this->authorize('operate', $activity);
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

            // Update optional notes if provided
            if (request()->has('notes')) {
                $activity->notes = request('notes');
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
