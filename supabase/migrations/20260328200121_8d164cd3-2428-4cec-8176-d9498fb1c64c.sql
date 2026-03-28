-- Create table for storing contract analyses
CREATE TABLE public.contract_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_title TEXT,
  document_text TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('safe', 'caution', 'risky')),
  verdict_explanation TEXT NOT NULL,
  summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  before_you_accept JSONB DEFAULT '[]'::jsonb,
  hidden_clauses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analyses
CREATE POLICY "Anyone can insert analyses"
  ON public.contract_analyses FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read analyses
CREATE POLICY "Anyone can read analyses"
  ON public.contract_analyses FOR SELECT
  USING (true);