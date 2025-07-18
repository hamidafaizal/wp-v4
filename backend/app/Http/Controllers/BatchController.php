<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\ProductLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BatchController extends Controller
{
    public function index()
    {
        $batches = Auth::user()->batches()
            ->with(['device', 'links'])
            ->withCount('links')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($batches);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'device_id' => 'nullable|exists:devices,id',
            'link_count' => 'required|integer|min:1|max:100',
        ]);

        DB::transaction(function () use ($request) {
            // Buat batch baru
            $batch = Auth::user()->batches()->create([
                'device_id' => $request->device_id,
                'name' => $request->name,
                'status' => 'pending',
                'total_links' => $request->link_count,
            ]);

            // Ambil link yang belum diassign ke batch
            $availableLinks = Auth::user()->links()
                ->whereNull('batch_id')
                ->where('status', 'pending')
                ->limit($request->link_count)
                ->get();

            // Assign link ke batch
            foreach ($availableLinks as $link) {
                $link->update(['batch_id' => $batch->id]);
            }

            // Update total_links sesuai dengan link yang benar-benar diassign
            $batch->update(['total_links' => $availableLinks->count()]);
        });

        return response()->json(['message' => 'Batch berhasil dibuat.']);
    }

    public function update(Request $request, Batch $batch)
    {
        if ($batch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $request->validate([
            'device_id' => 'nullable|exists:devices,id',
            'status' => 'sometimes|in:pending,sent,processing,completed',
        ]);

        $batch->update($request->only(['device_id', 'status']));

        return response()->json([
            'message' => 'Batch berhasil diperbarui.',
            'batch' => $batch->load(['device', 'links'])
        ]);
    }

    public function sendToPwa(Batch $batch)
    {
        if ($batch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        if (!$batch->device_id) {
            return response()->json(['message' => 'Device belum dipilih.'], 400);
        }

        $batch->update(['status' => 'sent']);

        return response()->json(['message' => 'Batch berhasil dikirim ke PWA.']);
    }

    public function destroy(Batch $batch)
    {
        if ($batch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        // Kembalikan link ke status unassigned
        $batch->links()->update(['batch_id' => null]);
        $batch->delete();

        return response()->json(['message' => 'Batch berhasil dihapus.']);
    }
}