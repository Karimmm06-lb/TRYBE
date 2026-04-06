<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 public function up(): void
    {
        Schema::create('appels_offres', function (Blueprint $table) {
            $table->id();
            $table->string('titre')->nullable();
            $table->string('domaine')->nullable();
            $table->string('fichier_path');
            $table->string('statut')->default('en_attente');
            $table->integer('score')->nullable();
            $table->text('resume')->nullable();
            $table->text('justification')->nullable();
            $table->date('date_limite')->nullable();
            $table->timestamp('date_analyse')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appels_offres');
    }
};
