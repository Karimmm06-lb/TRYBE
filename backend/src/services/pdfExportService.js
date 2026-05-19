import PDFDocument from 'pdfkit'

const COLORS = {
  bg: '#03030f',
  card: '#0d0d20',
  accent: '#00d4ff',
  purple: '#8b5cf6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  text: '#e2e8f0',
  muted: '#64748b',
  border: '#1e293b'
}

function scoreColor(score) {
  if (score >= 75) return COLORS.green
  if (score >= 50) return COLORS.accent
  return COLORS.red
}

function scoreLabel(score) {
  if (score >= 75) return 'Très pertinent'
  if (score >= 50) return 'Pertinent'
  return 'Non pertinent'
}

export function generateAoPdf(ao, stream) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 48, bottom: 48, left: 52, right: 52 },
    info: {
      Title: ao.titre,
      Author: 'TRYBE — Analyse IA des appels d\'offres',
      Subject: `Rapport d'analyse — ${ao.titre}`
    }
  })

  doc.pipe(stream)

  const W = doc.page.width - 104

  // ── Header bar ──────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 64).fill(COLORS.card)

  doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.accent)
    .text('⚡ TRYBE', 52, 20, { continued: true })
    .font('Helvetica').fontSize(11).fillColor(COLORS.muted)
    .text('  —  Rapport d\'analyse IA', { continued: false })

  doc.fontSize(9).fillColor(COLORS.muted)
    .text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 52, 44)

  doc.moveDown(3.5)

  // ── Titre AO ────────────────────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.text)
    .text(ao.titre, { width: W })

  doc.moveDown(0.5)

  // ── Domaine tag ─────────────────────────────────────────────────
  if (ao.domaine) {
    const tagText = `  ${ao.domaine}  `
    const tagW = doc.widthOfString(tagText) + 8
    const tagY = doc.y
    doc.roundedRect(52, tagY, tagW, 18, 9).fillAndStroke('#00d4ff18', COLORS.accent)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent)
      .text(tagText, 56, tagY + 4, { width: tagW })
    doc.y = tagY + 26
  }

  doc.moveDown(1)

  // ── Score ────────────────────────────────────────────────────────
  const score = ao.score ?? 0
  const sColor = scoreColor(score)
  const sLabel = scoreLabel(score)

  const scoreBoxY = doc.y
  doc.roundedRect(52, scoreBoxY, W, 72, 10).fillAndStroke(COLORS.card, COLORS.border)

  doc.fontSize(42).font('Helvetica-Bold').fillColor(sColor)
    .text(`${score}`, 72, scoreBoxY + 12, { continued: true })
  doc.fontSize(16).fillColor(COLORS.muted).text('/100', { continued: false })

  doc.fontSize(11).font('Helvetica-Bold').fillColor(sColor)
    .text(sLabel, 72, scoreBoxY + 52)

  // Score bar
  const barX = 200
  const barW = W - 160
  const barH = 8
  const barY = scoreBoxY + 30
  doc.roundedRect(barX, barY, barW, barH, 4).fill(COLORS.border)
  doc.roundedRect(barX, barY, Math.round(barW * score / 100), barH, 4).fill(sColor)

  doc.y = scoreBoxY + 84
  doc.moveDown(1)

  // ── Résumé ───────────────────────────────────────────────────────
  if (ao.resume) {
    sectionTitle(doc, 'Résumé', W)
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.text).leading(6)
      .text(ao.resume, { width: W, align: 'justify' })
    doc.moveDown(1)
  }

  // ── Justification du score ────────────────────────────────────────
  if (ao.justification) {
    sectionTitle(doc, 'Justification du score', W)
    const jY = doc.y
    doc.roundedRect(52, jY, W, estimateHeight(doc, ao.justification, W) + 20, 8)
      .fill(`${sColor}12`)
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.text).leading(6)
      .text(ao.justification, 68, jY + 10, { width: W - 32 })
    doc.moveDown(1.5)
  }

  // ── Compétences ───────────────────────────────────────────────────
  if (ao.competences?.length > 0) {
    sectionTitle(doc, 'Compétences requises', W)
    let cx = 52
    let cy = doc.y

    for (const comp of ao.competences) {
      const label = `  ${comp.competence}  `
      const tw = doc.fontSize(10).widthOfString(label) + 10
      if (cx + tw > 52 + W) {
        cx = 52
        cy += 24
      }
      doc.roundedRect(cx, cy, tw, 18, 9).fillAndStroke('#8b5cf618', COLORS.purple)
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.purple)
        .text(label, cx + 4, cy + 4, { width: tw })
      cx += tw + 8
    }
    doc.y = cy + 30
    doc.moveDown(0.5)
  }

  // ── Informations clés ─────────────────────────────────────────────
  sectionTitle(doc, 'Informations clés', W)

  const infos = [
    { label: 'Source', value: ao.source === 'auto' ? 'Récupération automatique' : 'Upload manuel' },
    { label: 'Format', value: ao.format?.toUpperCase() ?? 'N/A' },
    { label: 'Date d\'analyse', value: ao.dateAnalyse ? new Date(ao.dateAnalyse).toLocaleDateString('fr-FR') : 'N/A' },
    { label: 'Budget estimé', value: ao.budget_estime ? `${ao.budget_estime.toLocaleString('fr-FR')} €` : 'Non mentionné' },
    { label: 'Date limite', value: ao.dateLimite ? new Date(ao.dateLimite).toLocaleDateString('fr-FR') : 'Non mentionnée' },
    { label: 'Statut', value: formatStatut(ao.statut) }
  ]

  const colW = W / 2 - 8
  let infoY = doc.y

  for (let i = 0; i < infos.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 52 + col * (colW + 16)
    const y = infoY + row * 36

    doc.roundedRect(x, y, colW, 30, 6).fill(COLORS.card)
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted)
      .text(infos[i].label, x + 10, y + 6, { width: colW - 20 })
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
      .text(infos[i].value, x + 10, y + 16, { width: colW - 20 })
  }

  doc.y = infoY + Math.ceil(infos.length / 2) * 36 + 12
  doc.moveDown(1)

  // ── Footer ────────────────────────────────────────────────────────
  const footerY = doc.page.height - 52
  doc.moveTo(52, footerY).lineTo(52 + W, footerY).strokeColor(COLORS.border).lineWidth(1).stroke()
  doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted)
    .text('TRYBE — Analyse automatisée des appels d\'offres par intelligence artificielle', 52, footerY + 8, { width: W, align: 'center' })

  doc.end()
}

function sectionTitle(doc, title, W) {
  const y = doc.y
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.accent)
    .text(title, 52, y, { width: W })
  doc.moveDown(0.3)
  doc.moveTo(52, doc.y).lineTo(52 + 40, doc.y).strokeColor(COLORS.accent).lineWidth(2).stroke()
  doc.moveDown(0.6)
}

function estimateHeight(doc, text, width) {
  const lines = doc.fontSize(11).heightOfString(text, { width })
  return lines
}

function formatStatut(statut) {
  const map = {
    en_attente: 'En attente',
    pertinent: 'Pertinent',
    non_pertinent: 'Non pertinent',
    archive: 'Archivé',
    traite: 'Traité'
  }
  return map[statut] ?? statut
}
