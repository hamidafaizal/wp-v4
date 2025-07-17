<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Gudang;
use App\Models\CacheLink;
use App\Models\BatchConfig;
use App\Models\RiwayatPengiriman;
// Perubahan: Mengimpor Auth facade untuk mendapatkan data pengguna yang login.
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Mereset semua data transaksional dengan aman untuk pengguna yang sedang login.
     */
    public function forceRestart()
    {
        $user = Auth::user();

        try {
            // Perubahan: Hapus data hanya milik user yang sedang login
            Gudang::where('user_id', $user->id)->delete();
            CacheLink::where('user_id', $user->id)->delete();
            BatchConfig::where('user_id', $user->id)->delete();
            RiwayatPengiriman::where('user_id', $user->id)->delete();

            return response()->json(['message' => 'Sistem berhasil direset. Semua data link dan batch Anda telah dihapus.'], 200);
        } catch (\Exception $e) {
            \Log::error('Force Restart Failed for user ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mereset sistem.'], 500);
        }
    }

    /**
     * Mengambil data riwayat pengiriman milik pengguna yang sedang login.
     */
    public function getHistory()
    {
        $user = Auth::user();

        // Perubahan: Ambil riwayat yang hanya dimiliki oleh user ini
        $history = RiwayatPengiriman::where('user_id', $user->id)
            ->with('kontak')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json($history);
    }
}
