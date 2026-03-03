<?php

namespace App\Policies;

use App\Models\Estate;
use App\Models\User;

class EstatePolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Estate $estate): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Estate $estate): bool
    {
        return $user->isAdmin();
    }
}
