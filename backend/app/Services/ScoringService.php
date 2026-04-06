<?php

namespace App\Services;

use App\Models\AppelOffre;
use App\Models\CompetenceExtraite;

class ScoringService
{
    public function traiter(AppelOffre $ao, array $resultat): void
    {
        // 1. Mettre à jour l'AO avec les résultats OpenAI
        $ao->update([
            'titre'        => $resultat['titre'],
            'domaine'      => $resultat['domaine'],
            'resume'       => $resultat['resume'],
            'score'        => $resultat['score'],
            'justification'=> $resultat['justification'],
            'statut'       => $this->determinerStatut($resultat['score']),
            'date_analyse' => now(),
        ]);

        // 2. Sauvegarder les compétences extraites
        foreach ($resultat['competences'] as $competence) {
            CompetenceExtraite::create([
                'ao_id'      => $ao->id,
                'competence' => $competence,
            ]);
        }
    }

    private function determinerStatut(int $score): string
    {
        return match(true) {
            $score >= 75 => 'tres_pertinent',
            $score >= 50 => 'pertinent',
            default      => 'non_pertinent',
        };
    }

    public function estTresPertinent(int $score): bool
    {
        return $score >= 75;
    }
}