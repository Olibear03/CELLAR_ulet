<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CriticSummaryReport extends Model
{
    protected $fillable = [
        'user_id',
        'student_name',
        'course_degree',
        'manuscript_title',
        'document_type',
        'times_read',
        'page_count',
        'total_amount',
        'or_number',
    ];

    protected function casts(): array
    {
        return [
            'times_read'   => 'integer',
            'page_count'   => 'integer',
            'total_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
