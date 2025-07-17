<?php

namespace App\Http\Controllers;

use App\Models\Kontak;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KontakController extends Controller
{
    /**
     * Menampilkan semua kontak milik pengguna yang sedang login.
     */
    public function index()
    {
        return Auth::user()->kontaks()->orderBy('nama', 'asc')->get();
    }

    /**
     * Menyimpan kontak baru dan mengaitkannya dengan pengguna yang sedang login.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validatedData = $request->validate([
            'nama' => 'required|string|max:255',
            // Pastikan nomor_hp unik hanya untuk pengguna ini
            'nomor_hp' => [
                'required',
                'string',
                Rule::unique('kontaks')->where(function ($query) use ($user) {
                    return $query->where('user_id', $user->id);
                }),
            ],
        ]);

        // Buat kontak baru yang dimiliki oleh user
        $kontak = $user->kontaks()->create($validatedData);

        return response()->json($kontak, 201);
    }

    /**
     * Menampilkan satu data kontak spesifik, setelah memastikan kepemilikan.
     */
    public function show(Kontak $kontak)
    {
        // Otorisasi: Pastikan kontak ini milik user yang sedang login
        if ($kontak->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }
        return $kontak;
    }

    /**
     * Memperbarui data kontak, setelah memastikan kepemilikan.
     */
    public function update(Request $request, Kontak $kontak)
    {
        // Otorisasi: Pastikan kontak ini milik user yang sedang login
        if ($kontak->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $user = Auth::user();

        $validatedData = $request->validate([
            'nama' => 'required|string|max:255',
            'nomor_hp' => [
                'required',
                'string',
                Rule::unique('kontaks')->where(function ($query) use ($user) {
                    return $query->where('user_id', $user->id);
                })->ignore($kontak->id),
            ],
        ]);

        $kontak->update($validatedData);

        return response()->json($kontak);
    }

    /**
     * Menghapus data kontak, setelah memastikan kepemilikan.
     */
    public function destroy(Kontak $kontak)
    {
        // Otorisasi: Pastikan kontak ini milik user yang sedang login
        if ($kontak->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $kontak->delete();

        return response()->json(null, 204);
    }
}
