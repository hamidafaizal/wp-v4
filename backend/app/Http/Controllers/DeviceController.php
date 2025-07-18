<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    public function index()
    {
        $devices = Auth::user()->devices()->orderBy('created_at', 'desc')->get();
        return response()->json($devices);
    }

    public function generateToken()
    {
        $token = Str::random(32);
        return response()->json(['token' => $token]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'token' => 'required|string',
        ]);

        $device = Auth::user()->devices()->create([
            'name' => $request->name,
            'token' => $request->token,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Device berhasil didaftarkan.',
            'device' => $device
        ], 201);
    }

    public function destroy(Device $device)
    {
        if ($device->user_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $device->delete();
        return response()->json(['message' => 'Device berhasil dihapus.']);
    }
}