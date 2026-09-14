<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FileShare extends Model
{
    protected $fillable = ['archive_file_id', 'token'];

    /**
     * Auto-generate a UUID token when creating a new share record.
     */
    protected static function booted(): void
    {
        static::creating(function (FileShare $share) {
            if (empty($share->token)) {
                $share->token = (string) Str::uuid();
            }
        });
    }

    public function archiveFile()
    {
        return $this->belongsTo(ArchiveFile::class);
    }
}
