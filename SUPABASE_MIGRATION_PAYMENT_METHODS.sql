-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('transbank', 'mercadopago', 'stripe', 'paypal')),
  api_key TEXT,
  api_secret TEXT,
  config JSONB,
  is_production BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on provider for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider ON public.payment_methods(provider);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON public.payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_sort ON public.payment_methods(sort_order);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can view all payment methods
CREATE POLICY "Admin can view payment methods"
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can insert payment methods
CREATE POLICY "Admin can insert payment methods"
  ON public.payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can update payment methods
CREATE POLICY "Admin can update payment methods"
  ON public.payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can delete payment methods
CREATE POLICY "Admin can delete payment methods"
  ON public.payment_methods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO anon, authenticated, service_role;
