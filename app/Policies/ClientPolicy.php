<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    public function view(User $user, Client $client)
    {
        return $client->organization_id === $user->current_organization_id;
    }

    public function update(User $user, Client $client)
    {
        $role = $user->roleInOrganization($user->current_organization_id);
        return in_array($role, ['owner', 'admin']);
    }

    public function delete(User $user, Client $client)
    {
        return $this->update($user, $client);
    }
}