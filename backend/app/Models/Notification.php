<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications
    public function index()
    {
        $notifications = Notification::with('appelOffre')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($notifications);
    }

    // GET /api/notifications/{id}
    public function show(int $id)
    {
        $notification = Notification::with('appelOffre')
            ->findOrFail($id);
        return response()->json($notification);
    }
}