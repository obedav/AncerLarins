<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Admin can view any document.
     * Agents can view documents on leads that belong to their properties.
     * The uploader can always view their own uploads.
     */
    public function view(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Uploader can always view their own document
        if ($document->uploaded_by === $user->id) {
            return true;
        }

        // Agent can view documents on leads for their properties
        if ($user->agentProfile && $document->lead) {
            return $document->lead->agent_id === $user->agentProfile->id;
        }

        return false;
    }

    /**
     * Admin can upload documents to any lead.
     * Agents can upload documents to leads for their own properties.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isAgent();
    }

    public function updateStatus(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Only the uploader or an admin can delete.
     */
    public function delete(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $document->uploaded_by === $user->id;
    }
}
