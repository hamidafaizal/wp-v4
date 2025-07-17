<?php

namespace App\Models;

// 1. Import HasApiTokens
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // 2. Tambahkan trait HasApiTokens
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Mendefinisikan relasi bahwa seorang User memiliki banyak Kontak.
     */
    public function kontaks()
    {
        return $this->hasMany(Kontak::class);
    }

    /**
     * Mendefinisikan relasi bahwa seorang User memiliki banyak item di Gudang.
     */
    public function gudangItems()
    {
        return $this->hasMany(Gudang::class);
    }

    /**
     * Mendefinisikan relasi bahwa seorang User memiliki banyak Batch.
     */
    public function batchConfigs()
    {
        return $this->hasMany(BatchConfig::class);
    }

    /**
     * Mendefinisikan relasi bahwa seorang User memiliki banyak Riwayat Pengiriman.
     */
    public function riwayatPengiriman()
    {
        return $this->hasMany(RiwayatPengiriman::class);
    }

    /**
     * Mendefinisikan relasi bahwa seorang User memiliki banyak Cache Link.
     */
    public function cacheLinks()
    {
        return $this->hasMany(CacheLink::class);
    }
}
