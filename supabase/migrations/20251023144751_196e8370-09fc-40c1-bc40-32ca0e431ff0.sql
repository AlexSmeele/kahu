-- Create dog_health_issues table
CREATE TABLE public.dog_health_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text,
  subcategory text,
  first_line_screening text,
  typical_signs text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create junction table for breed-health relationships
CREATE TABLE public.dog_breed_health_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_id uuid NOT NULL REFERENCES public.dog_breeds(id) ON DELETE CASCADE,
  health_issue_id uuid NOT NULL REFERENCES public.dog_health_issues(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(breed_id, health_issue_id)
);

-- Enable RLS on dog_health_issues
ALTER TABLE public.dog_health_issues ENABLE ROW LEVEL SECURITY;

-- RLS policy for dog_health_issues (read-only for authenticated users)
CREATE POLICY "Authenticated users can view health issues"
  ON public.dog_health_issues
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Enable RLS on dog_breed_health_issues
ALTER TABLE public.dog_breed_health_issues ENABLE ROW LEVEL SECURITY;

-- RLS policy for dog_breed_health_issues (read-only for authenticated users)
CREATE POLICY "Authenticated users can view breed-health relationships"
  ON public.dog_breed_health_issues
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_dog_breed_health_issues_breed_id ON public.dog_breed_health_issues(breed_id);
CREATE INDEX idx_dog_breed_health_issues_health_issue_id ON public.dog_breed_health_issues(health_issue_id);
CREATE INDEX idx_dog_health_issues_name ON public.dog_health_issues(name);

-- Add trigger for updated_at on dog_health_issues
CREATE TRIGGER update_dog_health_issues_updated_at
  BEFORE UPDATE ON public.dog_health_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();