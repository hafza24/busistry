
ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS ocr_status text,
  ADD COLUMN IF NOT EXISTS ocr_amount numeric,
  ADD COLUMN IF NOT EXISTS ocr_transaction_id text,
  ADD COLUMN IF NOT EXISTS ocr_payment_method text,
  ADD COLUMN IF NOT EXISTS ocr_recipient_name text,
  ADD COLUMN IF NOT EXISTS ocr_sender_name text,
  ADD COLUMN IF NOT EXISTS ocr_date text,
  ADD COLUMN IF NOT EXISTS ocr_confidence numeric,
  ADD COLUMN IF NOT EXISTS ocr_notes text,
  ADD COLUMN IF NOT EXISTS ocr_raw jsonb,
  ADD COLUMN IF NOT EXISTS ocr_scanned_at timestamptz;

ALTER TABLE public.website_orders
  ADD COLUMN IF NOT EXISTS ocr_status text,
  ADD COLUMN IF NOT EXISTS ocr_amount numeric,
  ADD COLUMN IF NOT EXISTS ocr_transaction_id text,
  ADD COLUMN IF NOT EXISTS ocr_payment_method text,
  ADD COLUMN IF NOT EXISTS ocr_recipient_name text,
  ADD COLUMN IF NOT EXISTS ocr_sender_name text,
  ADD COLUMN IF NOT EXISTS ocr_date text,
  ADD COLUMN IF NOT EXISTS ocr_confidence numeric,
  ADD COLUMN IF NOT EXISTS ocr_notes text,
  ADD COLUMN IF NOT EXISTS ocr_raw jsonb,
  ADD COLUMN IF NOT EXISTS ocr_scanned_at timestamptz;
