<?php

namespace App\Http\Controllers;

use App\Models\ProductLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductLinkController extends Controller
{
    public function index()
    {
        $links = Auth::user()->links()
            ->with('batch')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($links);
    }

    public function store(Request $request)
    {
        $request->validate([
            'urls' => 'required|array',
            'urls.*' => 'required|url',
        ]);

        $links = [];
        foreach ($request->urls as $url) {
            $links[] = Auth::user()->links()->create([
                'url' => $url,
                'status' => 'pending',
            ]);
        }

        return response()->json([
            'message' => count($links) . ' link berhasil ditambahkan.',
            'links' => $links
        ], 201);
    }

    public function bulkUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $content = file_get_contents($file->getRealPath());
        $lines = explode("\n", $content);
        
        $links = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line) && filter_var($line, FILTER_VALIDATE_URL)) {
                $links[] = [
                    'user_id' => Auth::id(),
                    'url' => $line,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($links)) {
            ProductLink::insert($links);
        }

        return response()->json([
            'message' => count($links) . ' link berhasil diupload.',
            'count' => count($links)
        ]);
    }

    public function destroy(ProductLink $link)
    {
        if ($link->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $link->delete();
        return response()->json(['message' => 'Link berhasil dihapus.']);
    }
}