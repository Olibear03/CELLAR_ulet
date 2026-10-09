<?php

namespace App\Http\Controllers;

use App\Models\ArchiveFile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchiveFileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'file' => 'required',
            'metadata' => 'nullable|array',
            'folder_id' => 'nullable|exists:archive_files,id',
            'upload_mode' => 'nullable|string'
        ]);

        $folderId = $request->folder_id;
        $relativePaths = $request->input('relative_paths', []);

        $files = is_array($request->file('file')) ? $request->file('file') : [$request->file('file')];

        foreach ($files as $index => $file) {
            $path = $file->store('archives', 'public');
            $currentFolderId = $folderId;

            // Recreate hierarchy for folder uploads
            if ($request->upload_mode === 'folder' && !empty($relativePaths[$index])) {
                $parts = explode('/', $relativePaths[$index]);
                array_pop($parts); // Remove the filename at the end

                foreach ($parts as $folderName) {
                    $folder = ArchiveFile::firstOrCreate([
                        'title' => $folderName,
                        'folder_id' => $currentFolderId,
                        'file_path' => 'folder',
                    ], [
                        'description' => $request->description,
                        'category_id' => $request->category_id,
                        'user_id' => auth()->id(),
                        'original_filename' => 'folder',
                        'metadata' => array_merge($request->input('metadata', []), ['type' => 'folder']),
                    ]);
                    $currentFolderId = $folder->id;
                }
            }

            ArchiveFile::create([
                'title' => $request->upload_mode === 'folder' ? $file->getClientOriginalName() : $request->title,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'user_id' => auth()->id(),
                'folder_id' => $currentFolderId,
                'file_path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'metadata' => $request->input('metadata', []),
            ]);
        }

        \App\Models\ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'uploaded_documents',
            'type' => 'file_management',
            'location' => $request->input('current_path') ?: 'Documents',
        ]);

        return redirect('/documents' . ($request->input('current_path') ? '/' . $request->input('current_path') : ''))->with('success', 'File uploaded successfully.');
    }
}
