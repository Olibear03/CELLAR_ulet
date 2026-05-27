<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClientRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'request_date',
        'client_name',
        'address',
        'occupation',
        'contact_number',
        'email',
        'agency',
        'office_address',
        'services',
        'language_options',
        'proficiency_options',
        'translation_document',
        'research_title',
        'client_signature',
        'director_name',
        'printed_name',
        'admin_signature',
        'admin_printed_name',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'services'            => 'array',
        'language_options'    => 'array',
        'proficiency_options' => 'array',
        'request_date'        => 'date',
        'reviewed_at'         => 'datetime',
    ];

    public static function generateReferenceNumber(): string
    {
        $year  = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return 'CLLR-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
