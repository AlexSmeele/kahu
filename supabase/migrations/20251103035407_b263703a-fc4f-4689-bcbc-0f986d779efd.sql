-- Create user_breed_recommendations table
CREATE TABLE IF NOT EXISTS public.user_breed_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lifestyle_profile_id UUID NOT NULL REFERENCES public.lifestyle_profiles(id) ON DELETE CASCADE,
  breed_name TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  reasoning TEXT NOT NULL,
  considerations TEXT NOT NULL,
  rank INTEGER NOT NULL,
  shortlisted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_breed_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.user_breed_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own recommendations (for shortlisting)
CREATE POLICY "Users can update own recommendations"
  ON public.user_breed_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert recommendations
CREATE POLICY "Service role can insert recommendations"
  ON public.user_breed_recommendations
  FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_user_breed_recommendations_updated_at
  BEFORE UPDATE ON public.user_breed_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_user_breed_recommendations_user_profile 
  ON public.user_breed_recommendations(user_id, lifestyle_profile_id);
CREATE INDEX idx_user_breed_recommendations_shortlist 
  ON public.user_breed_recommendations(user_id, shortlisted) WHERE shortlisted = true;