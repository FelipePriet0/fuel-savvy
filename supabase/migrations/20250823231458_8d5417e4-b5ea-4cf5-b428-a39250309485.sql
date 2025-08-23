-- Criar bucket para logos dos postos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

-- Políticas para upload de logos
CREATE POLICY "Postos podem ver seus próprios logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Postos podem fazer upload de seus logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Postos podem atualizar seus logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Todos podem ver logos públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');