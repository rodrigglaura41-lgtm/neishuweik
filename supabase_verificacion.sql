-- Verifica si la tabla existe y tiene todos los campos
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY ordinal_position;

-- Si faltara algún campo (no debería), agrégalos con estos comandos:
-- ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;
-- ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
-- ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verifica las políticas de seguridad
SELECT * FROM pg_policies WHERE tablename = 'visitors';
