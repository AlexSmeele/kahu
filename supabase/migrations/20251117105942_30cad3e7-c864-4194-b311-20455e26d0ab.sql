-- Create foundation_modules table for training content
CREATE TABLE IF NOT EXISTS public.foundation_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  ideal_stage TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  brief_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  detailed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_foundation_modules_order ON public.foundation_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_foundation_modules_category ON public.foundation_modules(category);

-- Create user_module_completions table to track progress
CREATE TABLE IF NOT EXISTS public.user_module_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.foundation_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_module_completions_user ON public.user_module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_completions_module ON public.user_module_completions(module_id);

-- Enable RLS
ALTER TABLE public.foundation_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for foundation_modules (public read access)
CREATE POLICY "Anyone can view published foundation modules"
  ON public.foundation_modules
  FOR SELECT
  USING (is_published = true);

-- RLS Policies for user_module_completions (users can only manage their own)
CREATE POLICY "Users can view their own module completions"
  ON public.user_module_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions"
  ON public.user_module_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions"
  ON public.user_module_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module completions"
  ON public.user_module_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_foundation_modules_updated_at
  BEFORE UPDATE ON public.foundation_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();