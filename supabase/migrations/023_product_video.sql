-- 023_product_video.sql
-- Soporte para video opcional por producto

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN products.video_url IS
  'URL opcional de video del producto (mp4/webm). Se muestra en la página de detalle con lazy loading.';
