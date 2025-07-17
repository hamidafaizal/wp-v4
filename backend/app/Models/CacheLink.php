<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CacheLink extends Model
{
    use HasFactory;

    protected $table = 'cache_links';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_link',
        // Perubahan: Tambahkan user_id agar bisa diisi.
        'user_id',
    ];
}
