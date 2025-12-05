-- Create property-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Allow anyone to view property images (public bucket)
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Only admins can upload property images
CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND has_role(auth.uid(), 'ADMIN'::app_role)
);

-- Only admins can update property images
CREATE POLICY "Admins can update property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' 
  AND has_role(auth.uid(), 'ADMIN'::app_role)
);

-- Only admins can delete property images
CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND has_role(auth.uid(), 'ADMIN'::app_role)
);