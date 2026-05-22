/**
 * extractionService.js — Karim / Module Ingestion & Analyse
 * Extrait le texte brut d'un fichier PDF, DOCX ou TXT.
 */

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extrait le contenu texte d'un fichier uploadé.
 * @param {string} filePath  Chemin absolu vers le fichier temporaire
 * @param {string} mimetype  MIME type du fichier
 * @returns {Promise<string>} Texte brut extrait
 */
async function extractText(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  // PDF
  if (mimetype === "application/pdf" || ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  // DOCX
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  }

  // TXT (et tout autre type texte)
  if (mimetype.startsWith("text/") || ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8").trim();
  }

  throw new Error(`Format non supporté : ${ext || mimetype}`);
}

module.exports = { extractText };
