<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use App\Services\UsageService;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->clients()->get();
        // return response()->json(Client::all());
        
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'=>'required|string|max:255',
            'email'=>'nullable|email',
            'company'=>'nullable|string|max:255',
            'phone'=>'nullable|string|max:20',
            'notes'=>'nullable|string',
        ]);

        // $client = $request->user()->clients()->create($data);
        // if ($request->user()->organization->subscription_type === 'free') {
        //     UsageService::incrementUsage($request->user()->organization, 'clients');
        // }

        $organization = $request->user()->organization 
            ?? $request->user()->organizations()->first();

        if (!$organization) {
            return response()->json(['error' => 'No organization found'], 400);
        }

        $client = $organization->clients()->create($data);

        if ($organization->subscription_type === 'free') {
            UsageService::incrementUsage($organization, 'clients');
        }
        
        return response()->json($client, 201);
    }

    public function show(Request $request, Client $client)
    {
        $this->authorizeClient($request, $client);
        return $client;
    }

    public function update(Request $request, Client $client)
    {
        $this->authorizeClient($request, $client);

        $data = $request->validate([
            'name'=>'sometimes|required|string|max:255',
            'email'=>'nullable|email',
            'company'=>'nullable|string|max:255',
            'phone'=>'nullable|string|max:20',
            'notes'=>'nullable|string',
        ]);

        $client->update($data);

        return $client;
    }

    public function destroy(Request $request, Client $client)
    {
        $this->authorizeClient($request, $client);
        $client->delete();
        return response()->json(null, 204);
    }

    private function authorizeClient(Request $request, Client $client)
    {
        if ($client->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}