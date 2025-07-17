<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('riwayat_pengiriman', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kontak_id')->constrained('kontaks')->onDelete('cascade');
            $table->foreignId('batch_config_id')->constrained('batch_configs')->onDelete('cascade');
            $table->integer('jumlah_link');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('riwayat_pengiriman');
    }
};
