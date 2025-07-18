<?php

namespace App\Http\Controllers;

use App\Models\PerangkatPwa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PerangkatPwaController extends Controller
{
    /**
     * Menghasilkan token pendaftaran unik untuk perangkat PWA baru.
     * Token ini berlaku untuk waktu yang singkat (misalnya, 5 menit).
     */
    public function generateRegistrationToken()
    {
        $user = Auth::user();

        // Hapus token lama yang sudah kedaluwarsa untuk pengguna ini
        $user->perangkatPwas()
             ->where('token_expires_at', '<', Carbon::now())
             ->whereNull('unique_id') // Hanya hapus token yang belum dipakai
             ->delete();

        // Buat token baru
        $token = Str::random(40);
        $expiresAt = Carbon::now()->addMinutes(5);

        $perangkat = $user->perangkatPwas()->create([
            'registration_token' => $token,
            'token_expires_at' => $expiresAt,
        ]);

        return response()->json([
            'token' => $perangkat->registration_token,
            'expires_at' => $perangkat->token_expires_at->toIso8601String(),
        ]);
    }

    // Fungsi lain untuk proses registrasi dan verifikasi akan ditambahkan di sini nanti
}
