<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
// Perubahan: Impor Rule dan Auth
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Mendaftarkan pengguna baru.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil.',
            'user' => $user
        ], 201);
    }

    /**
     * Melakukan login pengguna dan membuat token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang Anda masukkan salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * Melakukan logout pengguna (menghapus token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * Mendapatkan data pengguna yang sedang login.
     */
    public function user(Request $request)
    {
        return $request->user();
    }

    /**
     * Perubahan: Tambahkan fungsi untuk memperbarui profil pengguna.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $validatedData['name'];
        $user->email = $validatedData['email'];

        if (!empty($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user,
        ]);
    }
}
