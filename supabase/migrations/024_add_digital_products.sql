-- Add digital product support to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS digital_file_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS digital_file_path TEXT;

-- Create index for digital product queries
CREATE INDEX IF NOT EXISTS idx_products_is_digital ON products(is_digital);
