<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OpenAI;

class AiController extends Controller
{
    public function generateProposalText(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
        ]);

        $openai = OpenAI::client(config('services.openai.api_key'));

        $response = $openai->chat()->create([
            'model' => 'gpt-4', // or 'gpt-3.5-turbo'
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant that writes professional client proposals.'],
                ['role' => 'user', 'content' => $request->prompt],
            ],
            'temperature' => 0.7,
            'max_tokens' => 600,
        ]);

        $text = $response->choices[0]->message->content ?? '';

        return response()->json(['text' => $text]);
    }

    public function modifyProposalText(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
        ]);

        $openai = OpenAI::client(config('services.openai.api_key'));

        $response = $openai->chat()->create([
            'model' => 'gpt-4', // or 'gpt-3.5-turbo'
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant that writes professional client proposals.'],
                ['role' => 'user', 'content' => $request->prompt],
            ],
            'temperature' => 0.7,
            'max_tokens' => 600,
        ]);

        $text = $response->choices[0]->message->content ?? '';

        return response()->json(['text' => $text]);
    }
}