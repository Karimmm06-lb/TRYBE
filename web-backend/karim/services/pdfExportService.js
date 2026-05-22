/**
 * pdfExportService.js — Karim / Module Ingestion & Analyse
 * Génère un rapport PDF pour un appel d'offres donné.
 * Utilise pdfkit, couleurs TRYBE (orange #e85d26, fond clair).
 */

const PDFDocument = require("pdfkit");

const ORANGE = "#e85d26";
const TEXT_DARK = "#1a1210";
const TEXT_MUTED = "#64748b";
const BG_LIGHT = "#fdf6f0";
const LINE_COLOR = "#f1e8e2";

/**
 * Pipe un PDF dans un stream.
 * @param {object} ao     Objet AppelOffre complet
 * @param {object} stream Stream de sortie (res ou fs.WriteStream)
 */
function generateAoPdf(ao, stream) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    doc.pipe(stream);
    doc.on("error", reject);
    stream.on("finish", resolve);
    stream.on("error", reject);

    const W = doc.page.width - 100; // largeur utile

    // ── Header bande orange ──────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(ORANGE);
    doc.fontSize(28).fillColor("#ffffff").font("Helvetica-Bold").text("trybe", 50, 22);
    doc.fontSize(11).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
       .text("Rapport d'Appel d'Offres", 50, 52);

    doc.moveDown(3.5);

    // ── Titre ────────────────────────────────────────────────────────────────
    doc.fontSize(18).fillColor(TEXT_DARK).font("Helvetica-Bold")
       .text(ao.titre || "Sans titre", { width: W });
    doc.moveDown(0.4);

    // Badges statut + score
    const statutLabel = {
      EN_ATTENTE: "En attente", ANALYSE: "Analysé",
      PERTINENT: "Pertinent", ARCHIVE: "Archivé", TRAITE: "Traité"
    }[ao.statut] || ao.statut;

    doc.fontSize(10).fillColor(ORANGE).font("Helvetica-Bold")
       .text(`${statutLabel}`, { continued: true });
    if (ao.score !== null && ao.score !== undefined) {
      doc.fillColor(TEXT_MUTED).font("Helvetica")
         .text(`   ·   Score IA : `, { continued: true })
         .fillColor(ao.score >= 70 ? "#10b981" : ao.score >= 40 ? "#f59e0b" : "#f43f5e")
         .font("Helvetica-Bold").text(`${ao.score}/100`);
    }
    doc.moveDown(0.8);

    // Séparateur
    doc.moveTo(50, doc.y).lineTo(50 + W, doc.y).strokeColor(LINE_COLOR).lineWidth(1).stroke();
    doc.moveDown(0.8);

    // ── Informations clés ────────────────────────────────────────────────────
    const infoItems = [
      ["Domaine", ao.domaine],
      ["Source", ao.sourceType],
      ["Budget estimé", ao.budgetEstime],
      ["Durée", ao.duree],
      ["Date limite", ao.dateLimite ? new Date(ao.dateLimite).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : null],
      ["Date d'analyse", ao.dateAnalyse ? new Date(ao.dateAnalyse).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : null],
    ].filter(([, v]) => v);

    if (infoItems.length) {
      doc.rect(50, doc.y, W, infoItems.length * 20 + 16).fill(BG_LIGHT);
      const startY = doc.y + 10;
      infoItems.forEach(([label, value], i) => {
        doc.fontSize(9).fillColor(TEXT_MUTED).font("Helvetica-Bold")
           .text(label.toUpperCase(), 62, startY + i * 20, { width: 110, continued: true });
        doc.fillColor(TEXT_DARK).font("Helvetica")
           .text(String(value), { width: W - 112 });
      });
      doc.y = startY + infoItems.length * 20 + 6;
      doc.moveDown(1);
    }

    // ── Score visuel ─────────────────────────────────────────────────────────
    if (ao.score !== null && ao.score !== undefined) {
      sectionTitle(doc, "Score de pertinence", W);
      const barY = doc.y;
      const barW = W;
      doc.rect(50, barY, barW, 10).fill("#e2e8f0");
      const filled = Math.round((ao.score / 100) * barW);
      const barColor = ao.score >= 70 ? "#10b981" : ao.score >= 40 ? "#f59e0b" : "#f43f5e";
      doc.rect(50, barY, filled, 10).fill(barColor);
      doc.y = barY + 18;
      doc.fontSize(9).fillColor(TEXT_MUTED).font("Helvetica")
         .text(`${ao.score} / 100 — ${ao.score >= 75 ? "Très pertinent" : ao.score >= 60 ? "Pertinent" : ao.score >= 40 ? "Moyen" : "Faible"}`, 50);
      doc.moveDown(1);
    }

    // ── Résumé ───────────────────────────────────────────────────────────────
    if (ao.resume) {
      sectionTitle(doc, "Résumé IA", W);
      doc.fontSize(10.5).fillColor(TEXT_DARK).font("Helvetica")
         .text(ao.resume, 50, doc.y, { width: W, lineGap: 4 });
      doc.moveDown(1);
    }

    // ── Justification ────────────────────────────────────────────────────────
    if (ao.justification) {
      sectionTitle(doc, "Justification du score", W);
      // barre latérale colorée
      const jY = doc.y;
      const jText = ao.justification;
      const lineH = Math.ceil(doc.heightOfString(jText, { width: W - 16 }));
      const barColor2 = ao.score >= 70 ? "#10b981" : ao.score >= 40 ? "#f59e0b" : "#f43f5e";
      doc.rect(50, jY, 3, lineH + 4).fill(barColor2);
      doc.fontSize(10.5).fillColor(TEXT_MUTED).font("Helvetica")
         .text(jText, 60, jY, { width: W - 16, lineGap: 4 });
      doc.y = jY + lineH + 12;
      doc.moveDown(0.5);
    }

    // ── Compétences ──────────────────────────────────────────────────────────
    if (ao.competences && ao.competences.length) {
      sectionTitle(doc, "Compétences requises", W);
      let cx = 50;
      const cy0 = doc.y;
      let cy = cy0;
      ao.competences.forEach((c) => {
        const tw = doc.widthOfString(c, { fontSize: 9 }) + 16;
        if (cx + tw > 50 + W) { cx = 50; cy += 22; }
        doc.rect(cx, cy, tw, 18).fill("#fde8dc");
        doc.fontSize(9).fillColor(ORANGE).font("Helvetica-Bold").text(c, cx + 8, cy + 4, { lineBreak: false });
        cx += tw + 6;
      });
      doc.y = cy + 26;
      doc.moveDown(0.5);
    }

    // ── Footer sur chaque page ───────────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#fff7f3");
      doc.fontSize(8).fillColor(TEXT_MUTED).font("Helvetica")
         .text(
           `TRYBE — Rapport généré le ${new Date().toLocaleDateString("fr-FR")}   |   Page ${i + 1}/${totalPages}`,
           50, doc.page.height - 26, { align: "center", width: W }
         );
    }

    doc.end();
  });
}

function sectionTitle(doc, title, W) {
  doc.fontSize(10).fillColor(ORANGE).font("Helvetica-Bold")
     .text(title.toUpperCase(), 50, doc.y, { width: W });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(50 + W, doc.y).strokeColor(LINE_COLOR).lineWidth(0.5).stroke();
  doc.moveDown(0.5);
}

module.exports = { generateAoPdf };
