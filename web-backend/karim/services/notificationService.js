/**
 * notificationService.js — Karim / Module Ingestion & Analyse
 * Envoie un email d'alerte et crée l'enregistrement Notification en base.
 */

const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Détermine le type de notification selon le score.
 */
function resolveType(score) {
  if (score >= 75) return "TRES_PERTINENT";
  if (score >= 60) return "PERTINENT";
  return "ALERTE_AO";
}

/**
 * Génère le HTML de l'email d'alerte.
 */
function buildEmailHtml(ao, type) {
  const badge =
    type === "TRES_PERTINENT"
      ? `<span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:99px;font-weight:700;">★ Très pertinent</span>`
      : `<span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:99px;font-weight:700;">Pertinent</span>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <!-- Header -->
    <div style="background:#e85d26;padding:28px 36px;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">trybe</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Nouvelle alerte appel d'offres</p>
    </div>
    <!-- Body -->
    <div style="padding:36px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;">Nouvel AO détecté</p>
      <h2 style="margin:0 0 20px;color:#1a1210;font-size:20px;font-weight:700;line-height:1.3;">${ao.titre}</h2>
      <div style="margin-bottom:20px;">${badge}</div>

      <div style="background:#fdf6f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:130px;">Score IA</td>
            <td style="padding:6px 0;color:#1a1210;font-weight:700;font-size:18px;">${ao.score}/100</td>
          </tr>
          ${ao.domaine ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Domaine</td><td style="padding:6px 0;color:#1a1210;font-size:14px;">${ao.domaine}</td></tr>` : ""}
          ${ao.budgetEstime ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Budget estimé</td><td style="padding:6px 0;color:#1a1210;font-size:14px;">${ao.budgetEstime}</td></tr>` : ""}
          ${ao.dateLimite ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Date limite</td><td style="padding:6px 0;color:#1a1210;font-size:14px;">${new Date(ao.dateLimite).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>` : ""}
        </table>
      </div>

      ${ao.resume ? `<p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">${ao.resume}</p>` : ""}

      <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/appels-offres/${ao.id}"
         style="display:inline-block;background:#e85d26;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
        Voir l'appel d'offres →
      </a>
    </div>
    <!-- Footer -->
    <div style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#fafafa;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">Vous recevez cet email car votre seuil d'alerte a été atteint. — TRYBE / SARL AIVOT</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envoie une alerte pour un AO et enregistre la notification en base.
 * @param {object} ao      Objet AppelOffre complet (doit avoir id, titre, score…)
 * @param {object} user    Objet User (id, email, notificationsEmail)
 * @param {boolean} force  Si true, ignore notificationsEmail
 */
async function envoyerAlerte(ao, user, force = false) {
  const type = resolveType(ao.score || 0);
  let statut = "ENVOYE";

  if ((user.notificationsEmail || force) && process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: `"TRYBE Alerts" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `[TRYBE] Nouvel AO ${type === "TRES_PERTINENT" ? "très pertinent" : "pertinent"} — ${ao.titre.slice(0, 60)}`,
        html: buildEmailHtml(ao, type),
      });
    } catch (err) {
      console.error("Erreur envoi email notification:", err.message);
      statut = "ECHEC";
    }
  }

  const notif = await prisma.notification.create({
    data: {
      aoId: ao.id,
      userId: user.id,
      type,
      statut,
    },
  });

  return notif;
}

module.exports = { envoyerAlerte, resolveType };
