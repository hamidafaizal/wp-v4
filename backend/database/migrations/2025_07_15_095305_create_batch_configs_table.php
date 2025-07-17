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
        Schema::create('batch_configs', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->integer('kapasitas')->default(10);
            // Kolom untuk menyimpan ID kontak yang ditugaskan ke batch ini
            $table->unsignedBigInteger('kontak_id')->nullable();
            $table->timestamps();

            // Menambahkan foreign key constraint (opsional, tapi praktik yang baik)
            // $table->foreign('kontak_id')->references('id')->on('kontaks')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('batch_configs');
    }
};
