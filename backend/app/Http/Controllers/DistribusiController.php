<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gudang;
use App\Models\BatchConfig;
use App\Models\Kontak;
use App\Models\CacheLink;
use App\Models\RiwayatPengiriman;
use Illuminate\Support\Facades\DB;
// Perubahan: Mengimpor Auth facade untuk mendapatkan data pengguna yang login.
use Illuminate\Support\Facades\Auth;

class DistribusiController extends Controller
{
    /**
     * Mengambil state awal untuk halaman distribusi milik pengguna yang sedang login.
     */
    public function getState()
    {
        // Dapatkan user yang sedang login
        $user = Auth::user();

        // Perubahan: Ambil data yang hanya dimiliki oleh user ini
        $linksInGudangCount = Gudang::where('user_id', $user->id)->whereNull('batch_config_id')->count();
        
        $batches = BatchConfig::where('user_id', $user->id)
            ->with('assignedContact')
            ->withCount(['links as links_count'])
            ->orderBy('id', 'asc')
            ->get();

        $contacts = Kontak::where('user_id', $user->id)->orderBy('nama', 'asc')->get();

        return response()->json([
            'linksInGudang' => $linksInGudangCount,
            'batches' => $batches,
            'contacts' => $contacts,
        ]);
    }

    /**
     * Mengatur (menambah/mengurangi) jumlah batch sesuai input user.
     */
    public function setupBatches(Request $request)
    {
        $request->validate(['jumlah_hp' => 'required|integer|min:0']);
        $newCount = $request->input('jumlah_hp');
        // Dapatkan user yang sedang login
        $user = Auth::user();

        DB::transaction(function () use ($newCount, $user) {
            // Perubahan: Ambil batch milik user saat ini
            $currentBatches = BatchConfig::where('user_id', $user->id)->orderBy('id', 'asc')->get();
            $currentCount = $currentBatches->count();

            if ($newCount > $currentCount) {
                // Jika jumlah baru lebih besar, tambahkan batch baru
                for ($i = $currentCount + 1; $i <= $newCount; $i++) {
                    BatchConfig::create([
                        // Perubahan: Tambahkan user_id saat membuat batch baru
                        'user_id' => $user->id,
                        'nama' => 'Batch #' . $i,
                        'kapasitas' => 100,
                    ]);
                }
            } elseif ($newCount < $currentCount) {
                // Jika jumlah baru lebih kecil, hapus batch dari belakang
                $batchesToDelete = $currentBatches->slice($newCount);
                $batchIdsToDelete = $batchesToDelete->pluck('id');

                // Perubahan: Kembalikan link dari batch yang akan dihapus ke gudang (hanya milik user ini)
                Gudang::where('user_id', $user->id)
                      ->whereIn('batch_config_id', $batchIdsToDelete)
                      ->update(['batch_config_id' => null]);

                // Perubahan: Hapus batch (sudah otomatis terfilter karena $batchesToDelete milik user)
                BatchConfig::whereIn('id', $batchIdsToDelete)->delete();
            }
        });

        return response()->json(['message' => 'Jumlah batch berhasil diperbarui.']);
    }

    /**
     * Mendistribusikan link dari gudang ke batch milik pengguna.
     */
    public function distributeLinks()
    {
        $user = Auth::user();

        DB::transaction(function () use ($user) {
            // Perubahan: Ambil link dan batch yang hanya dimiliki oleh user ini
            $availableLinks = Gudang::where('user_id', $user->id)->whereNull('batch_config_id')->get();
            $batches = BatchConfig::where('user_id', $user->id)->withCount('links as current_links_count')->orderBy('id', 'asc')->get();

            $linkIndex = 0;

            foreach ($batches as $batch) {
                $linksNeeded = $batch->kapasitas - $batch->current_links_count;
                if ($linksNeeded <= 0) {
                    continue;
                }

                $linksToAssign = $availableLinks->slice($linkIndex, $linksNeeded);
                if ($linksToAssign->isEmpty()) {
                    break; 
                }

                $linkIds = $linksToAssign->pluck('id');
                // Perubahan: Update link yang dimiliki user
                Gudang::where('user_id', $user->id)->whereIn('id', $linkIds)->update(['batch_config_id' => $batch->id]);

                $linkIndex += $linksToAssign->count();
            }
        });

        return response()->json(['message' => 'Link berhasil didistribusikan ke batch.']);
    }

    /**
     * Memperbarui batch (menugaskan kontak atau mengubah kapasitas).
     */
    public function updateBatch(Request $request, BatchConfig $batch)
    {
        // Perubahan: Otorisasi untuk memastikan batch ini milik user yang sedang login
        if ($batch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $validated = $request->validate([
            // Perubahan: Pastikan kontak_id yang dikirim juga milik user ini
            'kontak_id' => 'nullable|exists:kontaks,id,user_id,' . Auth::id(),
            'kapasitas' => 'sometimes|required|integer|min:1',
        ]);

        $batch->update($validated);
        
        return response()->json($batch->load('assignedContact'));
    }

    /**
     * Mengambil semua link yang ada di dalam batch tertentu.
     */
    public function getLinksForBatch(BatchConfig $batch)
    {
        // Perubahan: Otorisasi untuk memastikan batch ini milik user yang sedang login
        if ($batch->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }
        return response()->json($batch->links()->get());
    }
    
    /**
     * Mencatat link yang sudah terkirim ke cache dan membuat riwayat.
     */
    public function logSentLinks(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            // Perubahan: Pastikan batch_id ada dan milik user
            'batch_id' => 'required|exists:batch_configs,id,user_id,' . $user->id,
        ]);
        $batchId = $request->input('batch_id');

        DB::transaction(function () use ($batchId, $user) {
            // Perubahan: Ambil batch dan link milik user
            $batch = BatchConfig::where('user_id', $user->id)->find($batchId);
            $sentLinks = Gudang::where('user_id', $user->id)->where('batch_config_id', $batchId)->get();

            if ($sentLinks->isEmpty() || !$batch->kontak_id) {
                return;
            }

            // Perubahan: Buat catatan di riwayat pengiriman dengan user_id
            RiwayatPengiriman::create([
                'user_id' => $user->id,
                'kontak_id' => $batch->kontak_id,
                'batch_config_id' => $batch->id,
                'jumlah_link' => $sentLinks->count(),
            ]);

            // Perubahan: Pindahkan ke cache dengan user_id
            $linksToCache = $sentLinks->map(function ($link) use ($user) {
                return [
                    'user_id' => $user->id,
                    'product_link' => $link->product_link, 
                    'created_at' => now(), 
                    'updated_at' => now()
                ];
            })->all();
            CacheLink::insert($linksToCache);

            // Perubahan: Hapus dari gudang (hanya milik user ini)
            Gudang::where('user_id', $user->id)->whereIn('id', $sentLinks->pluck('id'))->delete();
        });

        return response()->json(['message' => 'Link terkirim berhasil dicatat.']);
    }
}
