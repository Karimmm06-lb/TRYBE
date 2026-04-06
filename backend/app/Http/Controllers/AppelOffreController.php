<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Services\DocumentExtractorService;
use App\Services\OpenAIService;
use App\Services\ScoringService;
use Illuminate\Http\Request;

class AppelOffreController extends Controller
{
    public function __construct(
        private DocumentExtractorService $extractor,
        private OpenAIService $openai,
        private ScoringService $scoring
    ) {}

    // POST /api/appels-offres
    public function store(Request $request)
    {
        // 1. Valider le fichier
        $request->validate([
            'fichier' => 'required|file|mimes:pdf,docx,txt|max:10240'
        ]);

        // 2. Sauvegarder le fichier
        $path = $request->file('fichier')->store('appels-offres');

        // 3. Créer l'AO en BDD
        $ao = AppelOffre::create([
            'fichier_path' => $path,
            'statut'       => 'en_attente',
        ]);

        // 4. Extraire le texte
        $texte = $this->extractor->extraire($path);

        // 5. Analyser avec OpenAI
        $resultat = $this->openai->analyser($texte);

        // 6. Scorer et sauvegarder
        $this->scoring->traiter($ao, $resultat);

        // 7. Retourner l'AO complet
        return response()->json(
            $ao->fresh()->load('competences'),
            201
        );
    }

    // GET /api/appels-offres/{id}
    public function show(int $id)
    {
        $ao = AppelOffre::with('competences')->findOrFail($id);
        return response()->json($ao);
    }

    // GET /api/appels-offres
    public function index()
    {
        $aos = AppelOffre::with('competences')
            ->orderBy('score', 'desc')
            ->get();
        return response()->json($aos);
    }
}