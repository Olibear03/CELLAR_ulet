<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_director',
        'is_assistant',
        'is_staff',
        'is_critic',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_director'       => 'boolean',
            'is_assistant'      => 'boolean',
            'is_staff'          => 'boolean',
            'is_critic'         => 'boolean',
        ];
    }

    /**
     * Derive a human-readable role label from the boolean flags.
     * Priority: Director > Assistant > Staff > Critic > User
     */
    public function getRoleLabelAttribute(): string
    {
        if ($this->is_director)  return 'Director';
        if ($this->is_assistant) return 'Admin Assistant';
        if ($this->is_staff)     return 'Staff';
        if ($this->is_critic)    return 'English Critic';
        return 'User';
    }

    /**
     * Can access the Document Management System (DMS).
     * Director, Admin Assistant, and Staff all have DMS access.
     */
    public function canAccessDms(): bool
    {
        return $this->is_director || $this->is_assistant || $this->is_staff;
    }

    /**
     * Can manage accounts (Account Management page).
     * Only Director and Admin Assistant.
     */
    public function canManageAccounts(): bool
    {
        return $this->is_director || $this->is_assistant;
    }

    public function criticSummaryReports(): HasMany
    {
        return $this->hasMany(CriticSummaryReport::class);
    }
}
