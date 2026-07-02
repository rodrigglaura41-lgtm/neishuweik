-- Crea la tabla de visitantes
CREATE TABLE IF NOT EXISTS public.visitors (
    id TEXT PRIMARY KEY,
    device_name TEXT,
    device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
    timestamp TIMESTAMPTZ NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    accuracy NUMERIC,
    user_agent TEXT,
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita la extensión PostGIS para geolocalización (opcional pero recomendado)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Añade un índice para consultas más rápidas por ubicación
CREATE INDEX IF NOT EXISTS idx_visitors_location ON public.visitors USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Habilita RLS (Row Level Security) - política de seguridad básica (todos pueden insertar/actualizar)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Política para permitir que cualquier persona inserte datos (ya que usamos la clave anónima)
CREATE POLICY "Permitir insertar visitantes anónimamente" 
ON public.visitors 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política para permitir que cualquier persona actualice sus propios datos
CREATE POLICY "Permitir actualizar visitantes anónimamente" 
ON public.visitors 
FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

-- Política para permitir que cualquier persona vea los datos (puedes cambiarla si necesitas seguridad adicional)
CREATE POLICY "Permitir ver visitantes anónimamente" 
ON public.visitors 
FOR SELECT 
TO anon 
USING (true);
