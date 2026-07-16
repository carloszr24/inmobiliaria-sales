CREATE TABLE public.properties (
  id text PRIMARY KEY,
  title text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  location text NOT NULL,
  type text NOT NULL,
  operation text DEFAULT 'venta',
  status text NOT NULL DEFAULT 'disponible',
  description text NOT NULL DEFAULT '',
  images text NOT NULL DEFAULT '[]',
  fotocasa_url text,
  bedrooms integer,
  bathrooms integer,
  sq_meters numeric,
  availability text,
  hot_water text,
  heating text,
  condition text,
  property_age text,
  floor text,
  garage text,
  elevator text,
  furnished text,
  energy_rating text,
  energy_value numeric,
  emissions_rating text,
  emissions_value numeric,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_public_read"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX properties_created_at_idx ON public.properties (created_at DESC);
CREATE INDEX properties_featured_idx ON public.properties (featured) WHERE featured = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "property_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'property-images');
