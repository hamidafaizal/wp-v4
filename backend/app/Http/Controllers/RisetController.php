<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gudang;
use App\Models\CacheLink;
use Illuminate\Support\Facades\Auth; // Import Auth Facade
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RisetController extends Controller
{
    /**
     * Menerima unggahan file CSV, memproses, memfilter, dan menyimpan link unik
     * untuk pengguna yang sedang login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processUpload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'required|file|mimes:csv,txt',
            'rank' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user(); // Dapatkan pengguna yang sedang login
            $rankToTake = $request->input('rank');

            // 1. Ambil semua link yang sudah ada MILIK PENGGUNA INI
            $existingInGudang = Gudang::where('user_id', $user->id)->pluck('product_link')->all();
            $existingInCache = CacheLink::where('user_id', $user->id)->pluck('product_link')->all();
            $allExistingLinks = array_merge($existingInGudang, $existingInCache);

            $allLinksFromFiles = collect();

            foreach ($request->file('files') as $file) {
                $path = $file->getRealPath();
                $file_data = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                
                if (count($file_data) < 2) {
                    continue;
                }

                $header = str_getcsv(array_shift($file_data));

                $requiredHeaders = ["Tren", "isAd", "Penjualan (30 Hari)", "productLink"];
                if (count(array_intersect($requiredHeaders, $header)) !== count($requiredHeaders)) {
                    continue;
                }

                $rows = collect($file_data)->map(function ($line) use ($header) {
                    $data = str_getcsv($line);
                    if (count($header) === count($data)) {
                        return array_combine($header, $data);
                    }
                    return null;
                })->filter();

                $nonTurun = $rows->filter(fn ($r) => isset($r['Tren']) && strtoupper($r['Tren']) !== 'TURUN');

                $adLinks = $nonTurun->filter(fn ($r) => isset($r['isAd']) && strtoupper($r['isAd']) === 'YES')
                                    ->pluck('productLink');

                $organikLinks = $nonTurun->filter(fn ($r) => isset($r['isAd'], $r['Tren']) && strtoupper($r['isAd']) === 'NO' && strtoupper($r['Tren']) === 'NAIK')
                                        ->sortByDesc(fn ($r) => (int) ($r['Penjualan (30 Hari)'] ?? 0))
                                        ->take($rankToTake)
                                        ->pluck('productLink');

                $allLinksFromFiles = $allLinksFromFiles->merge($adLinks)->merge($organikLinks);
            }

            $newLinks = $allLinksFromFiles->unique()->diff($allExistingLinks);

            if ($newLinks->isEmpty()) {
                return response()->json(['message' => 'Tidak ada link baru untuk ditambahkan.', 'added' => 0, 'duplicates' => $allLinksFromFiles->unique()->count()], 200);
            }

            // 3. Format data untuk dimasukkan ke tabel GUDANG, SERTAKAN USER_ID
            $linksToInsert = $newLinks->map(function ($link) use ($user) {
                return [
                    'user_id' => $user->id, // Tambahkan ID pengguna
                    'product_link' => $link, 
                    'status' => 'tersedia', 
                    'created_at' => now(), 
                    'updated_at' => now()
                ];
            })->values()->all();

            // 4. Masukkan link baru ke GUDANG
            Gudang::insert($linksToInsert);

            return response()->json([
                'message' => 'Proses riset selesai!',
                'added' => count($linksToInsert),
                'duplicates' => $allLinksFromFiles->unique()->count() - count($linksToInsert),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error processing research file: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan pada server saat memproses file.'], 500);
        }
    }
}
