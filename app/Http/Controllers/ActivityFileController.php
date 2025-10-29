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
        return response()->json($activityFile->load('activity'));
    }

    /**
     * Download the specified file.
     */
    public function download(ActivityFile $activityFile)
    {
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
