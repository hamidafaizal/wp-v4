<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Batch;
use App\Models\ProductLink;
use Illuminate\Http\Request;

class PwaController extends Controller
{
    public function getBatches(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
        ]);

        $device = Device::where('token', $request->device_token)
            ->where('is_active', true)
            ->first();

        if (!$device) {
            return response()->json(['batches' => []]);
        }

        $batches = $device->batches()
            ->whereIn('status', ['sent', 'processing'])
            ->with('links')
            ->get();

        return response()->json(['batches' => $batches]);
    }

    public function updateLinkStatus(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
            'link_id' => 'required|exists:product_links,id',
            'status' => 'required|in:processing,completed,failed',
        ]);

        $device = Device::where('token', $request->device_token)->first();
        if (!$device) {
            return response()->json(['message' => 'Device tidak ditemukan'], 404);
        }

        $link = ProductLink::find($request->link_id);
        if ($link->batch->device_id !== $device->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $link->update([
            'status' => $request->status,
            'processed_at' => now(),
        ]);

        // Update batch progress
        $batch = $link->batch;
        $processedCount = $batch->links()->whereIn('status', ['completed', 'failed'])->count();
        $batch->update(['processed_links' => $processedCount]);

        // Jika semua link sudah diproses, update status batch
        if ($processedCount >= $batch->total_links) {
            $batch->update(['status' => 'completed']);
        }

        return response()->json(['message' => 'Status link berhasil diperbarui.']);
    }

    public function completeBatch(Request $request)
    {
        $request->validate([
            'device_token' => 'required|string',
            'batch_id' => 'required|exists:batches,id',
        ]);

        $device = Device::where('token', $request->device_token)->first();
        if (!$device) {
            return response()->json(['message' => 'Device tidak ditemukan'], 404);
        }

        $batch = Batch::find($request->batch_id);
        if ($batch->device_id !== $device->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $batch->update(['status' => 'completed']);

        return response()->json(['message' => 'Batch berhasil diselesaikan.']);
    }
}