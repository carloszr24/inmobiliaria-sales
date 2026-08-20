import { rowToLead, rowsToLeads, type LeadRow } from '@/lib/leads'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-server'
import type { Lead } from '@/types'

export type LeadInsert = {
  fullName: string
  phone: string
  email: string | null
  notes: string | null
  source: Lead['source']
  intent: Lead['intent']
  priority: Lead['priority']
  propertyRef: string | null
  saleTimeline: string | null
}

function assertLeadsStorageConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }
}

export async function createLeadRecord(insert: LeadInsert): Promise<Lead> {
  assertLeadsStorageConfigured()
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      full_name: insert.fullName,
      phone: insert.phone,
      email: insert.email,
      notes: insert.notes,
      source: insert.source,
      intent: insert.intent,
      priority: insert.priority,
      property_ref: insert.propertyRef,
      sale_timeline: insert.saleTimeline,
      status: 'nuevo',
    })
    .select('*')
    .single()
  if (error) throw error
  return rowToLead(data as LeadRow)
}

export async function listLeads(): Promise<Lead[]> {
  assertLeadsStorageConfigured()
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return rowsToLeads(data as LeadRow[])
}
