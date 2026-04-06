<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompetenceExtraite extends Model
{
    protected $fillable = [
        'ao_id',
        'competence',
    ];

    public function appelOffre()
    {
        return $this->belongsTo(AppelOffre::class, 'ao_id');
    }
}
