<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'ao_id',
        'user_id',
        'type',
        'statut',
        'envoyee_le',
    ];

    public function appelOffre()
    {
        return $this->belongsTo(AppelOffre::class, 'ao_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
