<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\User;

class FileController extends Controller
{
    public function addFile(Request $request)
{
    $validated = $request->validate([
        'file_path' => ['required', 'file', 'max:10240'],
        'user_id' => ['required', 'integer'],
        'file_name' => ['required',  'string']
    ]);

    $file = $request->file('file_path');
    $path = $file->store('file_path', "public");
    $fileName = basename($path);

    $fileExtension = $file->getClientOriginalExtension();
    $fileSize = $file->getSize();
    $fileSize = round($fileSize / 1024, 2);
    // $ISMB = false;
    // if($fileSize > 1024){
    //     $fileSize = round($fileSize / (1024), 2);
    //     $ISMB = true;
    // }
    // $fileSize = $ISMB ? $fileSize . ' MB' : $fileSize . ' KB';

    $validated['file_path'] = asset( 'storage/' . $request->file('file_path')->store('file_path', "public"));
    // dd($validated);
    $fileEntry = File::create([
        'user_id' => $request->user_id,
        'file_path' => $fileName,
        'file_name' => $request->file_name,
        'file_type' => $fileExtension,
        'file_size' => $fileSize,
    ]);

    return response()->json([
        'message' => "File uploaded successfully!",
    ], 200);
}

public function list(Request $request){
    $request->validate([
        'user_id' => ['required', 'string'],
    ]);

    $files = File::where('user_id', $request->user_id)->get();

    if ($files->isEmpty()) {
        return response()->json([
            'message' => 'No files found for this user.',
            'files' => []
        ], 200);
    }

    return response()->json([
        'files' => $files
    ], 200);
}

public function changeName(Request $request){
    $request->validate([
        'file_name' => ['required', 'string'],
        'id' => ['required', 'integer']
    ]);
    $file = File::find($request->id);
    if (!$file) {
        return response()->json(['error' => 'File not found.'], 404);
    }
    $file->file_name = $request->file_name;
    $file->save();
    return response()->json([
        'message' => 'File name changed successfully.',
    ], 200);
}

public function deleteFile(Request $request){
    $request->validate([
        'id' =>  ['required', 'integer']
    ]);
    $file = File::find($request->id);
    if (!$file) {
        return response()->json(['error' => 'File not found.'], 404);
    }
    Storage::delete($file->file_path);

    $file->delete();

    return response()->json([
        'message' => 'File deleted successfully.',
    ], 200);
}
public function shareFile(Request $request){
    $validated = $request->validate([
        'file_path' => ['required', 'string', 'max:10240'],
        'file_name' => ['required',  'string'],
        'email'  => ['required', 'email'],
        'file_type' => ['required', 'string'],
        'file_size' => ['required', 'numeric']
    ]);

    // $file = $request->file('file_path');
    // $path = $file->store('file_path', "public");
    // $fileName = basename($path);

    // $fileExtension = $file->getClientOriginalExtension();
    // $fileSize = $file->getSize();
    // $fileSize = round($fileSize / 1024, 2);

    $user = User::where('email', $request->email)->first();
    $fileEntry = File::create([
        'user_id' => $user->id,
        'file_path' => $request->file_path,
        'file_name' => $request->file_name,
        'file_type' => $request->file_type,
        'file_size' => $request->file_size
    ]);

    return response()->json([
        'message' => "File uploaded successfully!",
    ], 200);
}

public function search(Request $request)
{
    $request->validate([
        'file_name' => ['required',  'string'],
        'user_id' => ['required', 'integer']
    ]);
    $file_name =  $request->file_name;
    return File::where('file_name','like',"%$file_name%")
           ->where('user_id', $request->user_id) // Add this condition
           ->get();
}

}
