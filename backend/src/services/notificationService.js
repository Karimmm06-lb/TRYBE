import nodemailer from 'nodemailer'
import prisma from '../prismaClient.js'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendNotificationIfNeeded(appelOffre, user, profil) {
  const threshold = profil?.seuilAlerte ?? Number(process.env.NOTIFICATION_THRESHOLD ?? 60)
  const highThreshold = profil?.seuilTresRelevant ?? 75

  if (!appelOffre.score || appelOffre.score < threshold) return

  const type = appelOffre.score >= highThreshold ? 'tres_pertinent' : 'pertinent'

  await prisma.notification.create({
    data: {
      ao_id: appelOffre.id,
      user_id: user.id,
      type,
      statut: 'envoye'
    }
  })

  if (user.notif_email_active && user.email && process.env.SMTP_USER) {
    await sendEmail(user.email, appelOffre, type)
  }
}

async function sendEmail(to, ao, type) {
  const isHigh = type === 'tres_pertinent'
  const color = isHigh ? '#10b981' : '#00d4ff'
  const label = isHigh ? '⭐ Très pertinent' : '✅ Pertinent'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Inter, Arial, sans-serif; background: #03030f; color: #e2e8f0; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #00d4ff, #8b5cf6); padding: 10px 20px; border-radius: 12px; color: white; font-weight: 700; font-size: 18px;">
        ⚡ TRYBE
      </div>
    </div>

    <div style="background: #0d0d20; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <div style="display: inline-block; padding: 4px 14px; background: ${color}15; border: 1px solid ${color}30; border-radius: 100px; color: ${color}; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        ${label}
      </div>

      <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 8px 0; line-height: 1.4;">${ao.titre}</h2>

      <div style="font-size: 48px; font-weight: 900; color: ${color}; margin: 24px 0 4px 0; font-family: 'Space Grotesk', sans-serif;">${ao.score}</div>
      <div style="font-size: 13px; color: #64748b; margin-bottom: 24px;">Score de pertinence / 100</div>

      ${ao.domaine ? `<div style="margin-bottom: 16px;"><span style="background: rgba(0,212,255,0.1); color: #00d4ff; padding: 4px 12px; border-radius: 100px; font-size: 12px; border: 1px solid rgba(0,212,255,0.2);">${ao.domaine}</span></div>` : ''}

      ${ao.resume ? `<p style="color: #94a3b8; line-height: 1.7; font-size: 14px; margin: 0 0 20px 0;">${ao.resume}</p>` : ''}

      <a href="${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/appels-offres/${ao.id}"
         style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #0ea5e9); color: #000; font-weight: 600; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px;">
        Voir l'appel d'offres →
      </a>
    </div>

    <p style="text-align: center; color: #334155; font-size: 12px;">
      TRYBE — Analyse IA des appels d'offres<br>
      <a href="#" style="color: #334155;">Se désabonner</a>
    </p>
  </div>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'TRYBE <noreply@trybe.app>',
      to,
      subject: `${isHigh ? '⭐' : '✅'} TRYBE — Nouveau AO pertinent : ${ao.titre} (${ao.score}/100)`,
      html
    })
  } catch (err) {
    console.warn('Email non envoyé:', err.message)
  }
}
