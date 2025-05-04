<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TaskFileController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $request->validate([
            'files.*' => 'required|file|max:10240', // 10MB max per file
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $fileName = Str::random(40) . '.' . $extension;

                // Store the file
                $path = $file->storeAs('task-files/' . $task->id, $fileName, 'public');

                // Create database record
                $taskFile = TaskFile::create([
                    'task_id' => $task->id,
                    'user_id' => Auth::id(),
                    'name' => $fileName,
                    'original_name' => $originalName,
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);

                $uploadedFiles[] = $taskFile;
            }
        }

        return back()->with('success', 'Files uploaded successfully.');
    }

    public function destroy(TaskFile $file)
    {
        // Delete the file from storage
        Storage::disk('public')->delete($file->path);

        // Delete the database record
        $file->delete();

        return back()->with('success', 'File deleted successfully.');
    }

    public function download(TaskFile $file)
    {
        return Storage::disk('public')->download($file->path, $file->original_name);
    }
}

