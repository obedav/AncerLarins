<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations;

class Document extends Model
{
    use HasUuids;

    protected $fillable = [
        'lead_id', 'uploaded_by', 'type', 'title',
        'file_path', 'file_name', 'mime_type', 'file_size',
        'notes', 'status',
    ];

    protected function casts(): array
    {
        return [
            'file_size'  => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ── Relationships ────────────────────────────────────

    public function lead(): Relations\BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function uploader(): Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // ── Scopes ───────────────────────────────────────────

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
