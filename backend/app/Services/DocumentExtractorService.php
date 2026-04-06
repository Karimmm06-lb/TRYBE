<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use PhpOffice\PhpWord\IOFactory;

class DocumentExtractorService
{
    public function extraire(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match($extension) {
            'pdf'  => $this->extrairePDF($path),
            'docx' => $this->extraireDOCX($path),
            'txt'  => $this->extraireTXT($path),
            default => throw new \Exception("Format non supporté : $extension")
        };
    }

    private function extrairePDF(string $path): string
    {
        $parser = new Parser();
        $pdf = $parser->parseFile(storage_path('app/' . $path));
        return $pdf->getText();
    }

    private function extraireDOCX(string $path): string
    {
        $phpWord = IOFactory::load(storage_path('app/' . $path));
        $texte = '';
        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $texte .= $element->getText() . ' ';
                }
            }
        }
        return trim($texte);
    }

    private function extraireTXT(string $path): string
    {
        return file_get_contents(storage_path('app/' . $path));
    }
}