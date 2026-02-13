<?php

namespace App\Services;

use App\Models\SavedSearch;
use App\Models\User;

class SavedSearchService
{
    public function create(User $user, array $data): SavedSearch
    {
        return SavedSearch::create(array_merge($data, [
            'user_id' => $user->id,
        ]));
    }

    public function delete(SavedSearch $savedSearch): void
    {
        $savedSearch->delete();
    }
}
