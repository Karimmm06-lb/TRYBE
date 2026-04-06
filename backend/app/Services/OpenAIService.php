<?php

namespace App\Services;

use GuzzleHttp\Client;

class OpenAIService
{
    private Client $client;
    private string $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.openai.key');
    }

    public function analyser(string $texte): array
    {
        $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Tu es un assistant qui analyse des appels d\'offres. Tu retournes uniquement un JSON valide sans aucun texte autour.'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Analyse cet appel d'offres et retourne un JSON avec ces champs exactement :
                        {
                            \"titre\": \"titre de l'AO\",
                            \"domaine\": \"domaine principal\",
                            \"resume\": \"résumé en 3 phrases\",
                            \"competences\": [\"competence1\", \"competence2\"],
                            \"score\": 85,
                            \"justification\": \"pourquoi ce score\"
                        }

                        Voici le texte de l'appel d'offres :
                        $texte"
                    ]
                ],
                'temperature' => 0.3,
            ]
        ]);

        $body = json_decode($response->getBody()->getContents(), true);
        $content = $body['choices'][0]['message']['content'];

        return json_decode($content, true);
    }
}