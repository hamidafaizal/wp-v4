<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiwayatPengiriman extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pengiriman';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kontak_id',
        'batch_config_id',
        'jumlah_link',
        // Perubahan: Tambahkan user_id agar bisa diisi.
        'user_id',
    ];

    /**
     * Mendefinisikan relasi ke model Kontak.
     */
    public function kontak()
    {
        return $this->belongsTo(Kontak::class);
    }
}
