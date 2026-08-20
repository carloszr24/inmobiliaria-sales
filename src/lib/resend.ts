import type { Lead, LeadSource } from '@/types'
import { LEAD_INTENT_LABELS, LEAD_SOURCE_LABELS } from '@/lib/leads'

type SendResult = { ok: true } | { ok: false; error: string }

const LEAD_EMAIL_TITLES: Record<LeadSource, string> = {
  web_contacto: 'Nuevo contacto solicitado!',
  web_valoracion: 'Nueva Valoración Gratuita!',
  facebook: 'Nuevo lead de Facebook!',
  whatsapp: 'Nuevo lead de WhatsApp!',
  telefono: 'Nuevo lead telefónico!',
  otro: 'Nuevo lead recibido!',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildText(lead: Lead): string {
  return [
    LEAD_EMAIL_TITLES[lead.source],
    '',
    `Nombre: ${lead.fullName}`,
    `Telefono: ${lead.phone}`,
    `Email: ${lead.email || 'No indicado'}`,
    `Origen: ${LEAD_SOURCE_LABELS[lead.source]}`,
    `Interes: ${LEAD_INTENT_LABELS[lead.intent]}`,
    `Notas: ${lead.notes || 'No indicado'}`,
  ].join('\n')
}

const BRAND = '#E00880'
const BRAND_DARK = '#8C0558'

function formatLeadDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function buildHtml(lead: Lead): string {
  const field = (label: string, value: string, valueHref?: string) => `
    <tr>
      <td style="padding:14px 32px 0;">
        <div style="text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;font-size:11px;font-weight:600;margin-bottom:4px;">${escapeHtml(label)}</div>
        <div style="color:#1c1917;font-size:15px;">
          ${valueHref ? `<a href="${escapeHtml(valueHref)}" style="color:${BRAND};text-decoration:none;font-weight:600;">${escapeHtml(value)}</a>` : escapeHtml(value)}
        </div>
      </td>
    </tr>`

  const phoneHref = `tel:${lead.phone.replace(/\s+/g, '')}`
  const emailHref = lead.email ? `mailto:${lead.email}` : null

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#f5f5f4;padding:24px 12px;">
    <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:${BRAND};padding:28px 32px;">
          <div style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;margin-bottom:6px;">Sales Inmobiliaria</div>
          <div style="color:#ffffff;font-size:22px;font-weight:700;">${escapeHtml(LEAD_EMAIL_TITLES[lead.source])}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 0;">
          <span style="display:inline-block;background:${BRAND_DARK};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${escapeHtml(LEAD_SOURCE_LABELS[lead.source])}</span>
          <span style="display:inline-block;color:#a8a29e;font-size:13px;margin-left:10px;">${escapeHtml(formatLeadDate(lead.createdAt))}</span>
        </td>
      </tr>
      ${field('Nombre', lead.fullName)}
      ${field('Telefono', lead.phone, phoneHref)}
      ${lead.email ? field('Email', lead.email, emailHref!) : ''}
      ${field('Interes', LEAD_INTENT_LABELS[lead.intent])}
      <tr>
        <td style="padding:14px 32px 0;">
          <div style="text-transform:uppercase;letter-spacing:0.05em;color:#a8a29e;font-size:11px;font-weight:600;margin-bottom:6px;">Mensaje</div>
          <div style="background:#f5f5f4;border-radius:8px;padding:14px 16px;color:#44403c;font-size:14px;line-height:1.5;">${escapeHtml(lead.notes || 'Sin mensaje adicional.')}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 28px;">
          <a href="${phoneHref}" style="display:block;text-align:center;background:${BRAND};color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px;border-radius:8px;margin-bottom:10px;">Llamar ahora</a>
          ${emailHref ? `<a href="${emailHref}" style="display:block;text-align:center;background:#ffffff;color:${BRAND};font-weight:700;font-size:14px;text-decoration:none;padding:13px;border-radius:8px;border:1.5px solid ${BRAND};">Responder por email</a>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;background:#fafaf9;border-top:1px solid #f0efed;">
          <div style="color:#a8a29e;font-size:12px;text-align:center;">salesinmobiliaria.es</div>
        </td>
      </tr>
    </table>
  </div>`
}

export async function sendLeadEmailNotification(lead: Lead): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const recipients = process.env.LEADS_NOTIFICATION_EMAIL
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!apiKey || !recipients) {
    return { ok: false, error: 'RESEND_API_KEY o LEADS_NOTIFICATION_EMAIL no configurados' }
  }

  const to = recipients.split(',').map((r) => r.trim()).filter(Boolean)
  if (to.length === 0) {
    return { ok: false, error: 'LEADS_NOTIFICATION_EMAIL no contiene destinatarios validos' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `${LEAD_EMAIL_TITLES[lead.source]} — ${lead.fullName}`,
        text: buildText(lead),
        html: buildHtml(lead),
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, error: `Resend respondio ${res.status}: ${body}` }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Error desconocido enviando email' }
  }
}
