<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchConfig extends Model
{
    use HasFactory;

    protected $table = 'batch_configs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama',
        'kapasitas',
        'kontak_id',
        // Perubahan: Tambahkan user_id agar bisa diisi secara massal.
        'user_id',
    ];

    /**
     * Mendefinisikan relasi "satu batch memiliki banyak link".
     */
    public function links()
    {
        return $this->hasMany(Gudang::class);
    }

    /**
     * Mendefinisikan relasi "satu batch ditugaskan ke satu kontak".
     */
    public function assignedContact()
    {
        return $this->belongsTo(Kontak::class, 'kontak_id');
    }
}
