-- Create luxury_items table for both shopping and auction catalog items
CREATE TABLE public.luxury_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('shopping', 'auction')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  price NUMERIC,
  estimate_low NUMERIC,
  estimate_high NUMERIC,
  auction_house TEXT,
  auction_date TIMESTAMP WITH TIME ZONE,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  provenance TEXT,
  details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.luxury_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view active items
CREATE POLICY "Anyone can view active luxury items"
ON public.luxury_items
FOR SELECT
USING (status = 'active');

-- Admins can manage all items
CREATE POLICY "Admins can manage luxury items"
ON public.luxury_items
FOR ALL
USING (has_role(auth.uid(), 'ADMIN'));

-- Create trigger for updated_at
CREATE TRIGGER update_luxury_items_updated_at
BEFORE UPDATE ON public.luxury_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert sample shopping items
INSERT INTO public.luxury_items (type, title, description, category, brand, price, images, featured, details) VALUES
('shopping', 'Birkin 35 Togo Leather', 'Iconic Hermès Birkin bag in Togo leather with palladium hardware. Pristine condition.', 'Fashion', 'Hermès', 45000, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], true, '{"color": "Gold", "material": "Togo Leather", "hardware": "Palladium"}'),
('shopping', 'Nautilus 5711/1A-010', 'Patek Philippe Nautilus in stainless steel. Blue dial, date display. Complete set.', 'Watches', 'Patek Philippe', 185000, ARRAY['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'], true, '{"case": "40mm Steel", "movement": "Automatic", "reference": "5711/1A-010"}'),
('shopping', 'Zenith Crystal Chandelier', 'Baccarat Zenith chandelier with 24 lights. Hand-cut crystal, stunning brilliance.', 'Home & Art', 'Baccarat', 28000, ARRAY['https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800'], true, '{"lights": 24, "diameter": "37 inches", "material": "Hand-cut Crystal"}'),
('shopping', 'Malle Courrier Trunk', 'Vintage Louis Vuitton courier trunk circa 1920. Museum quality restoration.', 'Accessories', 'Louis Vuitton', 32000, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'], false, '{"era": "1920s", "condition": "Restored", "size": "110cm"}'),
('shopping', 'Royal Oak Offshore', 'Audemars Piguet Royal Oak Offshore Chronograph. Rose gold case, ceramic bezel.', 'Watches', 'Audemars Piguet', 68000, ARRAY['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800'], true, '{"case": "44mm Rose Gold", "movement": "Automatic", "reference": "26401RO"}'),
('shopping', 'Kelly 28 Epsom', 'Hermès Kelly 28 in Epsom leather. Black with gold hardware. Brand new.', 'Fashion', 'Hermès', 38000, ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'], false, '{"color": "Noir", "material": "Epsom Leather", "hardware": "Gold"}'),
('shopping', 'Panthère de Cartier Necklace', '18K white gold necklace with emeralds, onyx, and diamonds. Exceptional craftsmanship.', 'Jewelry', 'Cartier', 125000, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], true, '{"metal": "18K White Gold", "stones": "Emeralds, Diamonds, Onyx"}'),
('shopping', 'Dom Pérignon P3 1990', 'Third Plenitude release. Six bottles in original wooden case. Perfect provenance.', 'Wine & Spirits', 'Dom Pérignon', 8500, ARRAY['https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800'], false, '{"vintage": 1990, "bottles": 6, "storage": "Professional Cellar"}');

-- Insert sample auction items
INSERT INTO public.luxury_items (type, title, description, category, brand, estimate_low, estimate_high, auction_house, auction_date, images, featured, provenance, details) VALUES
('auction', 'Campbell''s Soup Cans (Tomato)', 'Andy Warhol silkscreen print, 1962. Signed and numbered. Excellent condition.', 'Fine Art', 'Andy Warhol', 800000, 1200000, 'Christie''s', '2025-02-15 14:00:00+00', ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'], true, 'Private collection, New York. Acquired directly from the artist.', '{"medium": "Silkscreen on Canvas", "dimensions": "20 x 16 inches", "signed": true}'),
('auction', '1967 Ferrari 275 GTB/4', 'Matching numbers, Ferrari Classiche certified. Concours restoration by leading specialist.', 'Automobiles', 'Ferrari', 2500000, 3000000, 'RM Sotheby''s', '2025-03-20 18:00:00+00', ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'], true, 'Single family ownership since 1972. Complete service history.', '{"engine": "V12 DOHC", "transmission": "5-Speed Manual", "mileage": "42,000 km"}'),
('auction', 'Château Lafite Rothschild 1982', 'Full case of 12 bottles. Perfect fill levels, pristine labels. Professional storage.', 'Wine', 'Château Lafite', 15000, 20000, 'Sotheby''s', '2025-01-28 10:00:00+00', ARRAY['https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800'], false, 'From the cellar of a distinguished European collector.', '{"bottles": 12, "format": "750ml", "storage": "Temperature Controlled"}'),
('auction', 'Art Deco Diamond Brooch', 'Cartier Paris, circa 1925. Platinum with old European cut diamonds. Museum quality.', 'Jewelry', 'Cartier', 150000, 200000, 'Christie''s', '2025-04-10 14:00:00+00', ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], true, 'Estate of a prominent French aristocratic family.', '{"metal": "Platinum", "diamonds": "15.5 carats total", "era": "Art Deco"}'),
('auction', 'Water Lilies (Nymphéas)', 'Claude Monet oil on canvas, 1906. From the artist''s celebrated garden series.', 'Fine Art', 'Claude Monet', 25000000, 35000000, 'Sotheby''s', '2025-05-15 19:00:00+00', ARRAY['https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800'], true, 'Private collection since 1962. Exhibited at major institutions worldwide.', '{"medium": "Oil on Canvas", "dimensions": "39 x 79 inches", "period": "Giverny"}'),
('auction', 'Rolex Daytona Paul Newman', 'Reference 6239, exotic dial variant. Unpolished case, original bracelet. Complete set.', 'Watches', 'Rolex', 400000, 600000, 'Phillips', '2025-02-28 17:00:00+00', ARRAY['https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800'], true, 'Originally purchased in 1968. Single owner until 2010.', '{"reference": "6239", "dial": "Exotic Paul Newman", "year": 1968}'),
('auction', 'George II Mahogany Commode', 'Thomas Chippendale attributed, circa 1760. Exceptional carved detail and original brass.', 'Furniture', 'Thomas Chippendale', 80000, 120000, 'Christie''s', '2025-03-05 11:00:00+00', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], false, 'From a distinguished English country house collection.', '{"period": "George II", "wood": "Mahogany", "dimensions": "34 x 52 x 24 inches"}'),
('auction', 'Macallan 1926 60 Year Old', 'Single malt whisky, Valerio Adami label. One of only 12 bottles produced.', 'Wine & Spirits', 'Macallan', 1500000, 2000000, 'Sotheby''s', '2025-06-01 15:00:00+00', ARRAY['https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800'], true, 'Private collection. Stored in professional bonded facility.', '{"age": "60 Years", "bottled": 1986, "label": "Valerio Adami"}');