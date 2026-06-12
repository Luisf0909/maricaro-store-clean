-- Create table for secure download tokens
CREATE TABLE IF NOT EXISTS order_download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  download_count INT DEFAULT 0,
  max_downloads INT DEFAULT 5,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON order_download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON order_download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON order_download_tokens(expires_at);

-- Enable RLS
ALTER TABLE order_download_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can query by token
CREATE POLICY "Anyone can download with valid token"
  ON order_download_tokens FOR SELECT
  USING (expires_at > now() AND download_count < max_downloads);
