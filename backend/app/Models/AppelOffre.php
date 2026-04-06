<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppelOffre extends Model
{
    protected $fillable = [
        'titre',
        'domaine',
        'fichier_path',
        'statut',
        'score',
        'resume',
        'justification',
        'date_limite',
        'date_analyse',
    ];

    public function competences()
    {
        return $this->hasMany(CompetenceExtraite::class, 'ao_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'ao_id');
    }
}
