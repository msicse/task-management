<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\ActivityFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class ActivityFileController extends Controller
{
    /**
     * Display a listing of files for an activity.
     */
    public function index(Activity $activity): JsonResponse
    {
        $this->authorize('manageFiles', $activity);

        $files = $activity->files;
        return response()->json($files);
    }

    /**
     * Store a newly uploaded file for an activity.
     */
    public function store(Request $request, Activity $activity): JsonResponse|RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);
        $this->authorize('manageFiles', $activity);

        $file = $request->file('file');
        $path = $file->store('activity-files', 'public');

        $activityFile = ActivityFile::create([
            'activity_id' => $activity->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        if ($request->wantsJson()) {
            return response()->json($activityFile, 201);
        }

        return back()->with('success', 'File uploaded successfully.');
    }

    /**
     * Display the specified file.
     */
    public function show(ActivityFile $activityFile): JsonResponse
    {
        $this->authorize('manageFiles', $activityFile->activity);

        return response()->json($activityFile->load('activity'));
    }

    /**
     * Download the specified file.
     */
    public function download(ActivityFile $activityFile)
    {
        $this->authorize('manageFiles', $activityFile->activity);

        if (!Storage::disk('public')->exists($activityFile->file_path)) {
            abort(404, 'File not found.');
        }

        return response()->download(
            Storage::disk('public')->path($activityFile->file_path),
            $activityFile->original_name
        );
    }

    /**
     * Remove the specified file from storage.
     */
    public function destroy(ActivityFile $activityFile): JsonResponse|RedirectResponse
    {
        $this->authorize('manageFiles', $activityFile->activity);

        // Delete the physical file
        if (Storage::disk('public')->exists($activityFile->file_path)) {
            Storage::disk('public')->delete($activityFile->file_path);
        }

        // Delete the database record
        $activityFile->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'File deleted successfully.']);
        }

        return back()->with('success', 'File deleted successfully.');
    }

    /**
     * Upload multiple files at once
     */
    public function uploadMultiple(Request $request, Activity $activity): JsonResponse
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // 10MB max per file
        ]);

        // Permission: only Admin or activity owner can upload
        $currentUser = auth()->user();
        if (! $currentUser->hasRole('Admin') && $activity->user_id !== $currentUser->id) {
            return response()->json(['error' => 'You are not authorized to upload files for this activity.'], 403);
        }

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('activity-files', 'public');

            $activityFile = ActivityFile::create([
                'activity_id' => $activity->id,
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            $uploadedFiles[] = $activityFile;
        }

        return response()->json([
            'message' => 'Files uploaded successfully.',
            'files' => $uploadedFiles
        ], 201);
    }
}
