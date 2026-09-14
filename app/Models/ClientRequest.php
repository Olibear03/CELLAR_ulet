<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ClientRequest extends Model
{
    use HasFactory;

    protected $table = 'client_requests';

    protected $guarded = [];

    protected $casts = [
        'services' => 'array',
        'language_options' => 'array',
        'request_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public static function generateReferenceNumber(): string
    {
        do {
            $reference = 'CR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(8));
        } while (self::where('reference_number', $reference)->exists());

        return $reference;
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
