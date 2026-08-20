import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { LEAD_INTENTS, LEAD_PRIORITIES, LEAD_SOURCES } from '@/lib/leads'
import { createLeadRecord, listLeads } from '@/lib/leads-repository'
import { sendLeadEmailNotification } from '@/lib/resend'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }
  try {
    const leads = await listLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error listando leads:', error)
    return NextResponse.json({ error: 'No se pudieron cargar los leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fullName = String(body.fullName || '').trim()
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim() || null
    const notes = String(body.notes || '').trim() || null
    const source = String(body.source || 'web_contacto')
    const intent = String(body.intent || 'otro')
    const priority = String(body.priority || 'media')
    const propertyRef = String(body.propertyRef || '').trim() || null
    const saleTimeline = String(body.saleTimeline || '').trim() || null

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'Nombre y telefono son obligatorios' }, { status: 400 })
    }
    if (!LEAD_SOURCES.includes(source as (typeof LEAD_SOURCES)[number])) {
      return NextResponse.json({ error: 'Origen de lead no valido' }, { status: 400 })
    }
    if (!LEAD_INTENTS.includes(intent as (typeof LEAD_INTENTS)[number])) {
      return NextResponse.json({ error: 'Tipo de interes no valido' }, { status: 400 })
    }
    if (!LEAD_PRIORITIES.includes(priority as (typeof LEAD_PRIORITIES)[number])) {
      return NextResponse.json({ error: 'Prioridad no valida' }, { status: 400 })
    }

    const lead = await createLeadRecord({
      fullName,
      phone,
      email,
      notes,
      source: source as (typeof LEAD_SOURCES)[number],
      intent: intent as (typeof LEAD_INTENTS)[number],
      priority: priority as (typeof LEAD_PRIORITIES)[number],
      propertyRef,
      saleTimeline,
    })

    const emailResult = await sendLeadEmailNotification(lead)
    if (!emailResult.ok) {
      console.error('Error enviando notificacion de lead por email:', emailResult.error)
    }

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error al crear lead:', error)
    return NextResponse.json({ error: 'Error al crear lead' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  void request
  return NextResponse.json(
    { error: 'La edicion de leads requiere almacenamiento persistente (no disponible).' },
    { status: 501 }
  )
}
