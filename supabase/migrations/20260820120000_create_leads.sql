CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  source text NOT NULL DEFAULT 'web_contacto',
  intent text NOT NULL DEFAULT 'otro',
  status text NOT NULL DEFAULT 'nuevo',
  priority text NOT NULL DEFAULT 'media',
  property_ref text,
  notes text,
  sale_timeline text,
  assigned_to text,
  first_response_at timestamptz,
  last_contact_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Sin políticas públicas: los leads son datos sensibles y solo se leen/escriben
-- desde el servidor con la service role key (que salta RLS).

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);
