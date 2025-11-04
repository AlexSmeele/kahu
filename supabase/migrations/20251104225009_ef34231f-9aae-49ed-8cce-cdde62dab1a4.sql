-- Create training programs table
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  age_group TEXT NOT NULL, -- 'puppy', 'adolescent', 'adult', 'senior'
  min_age_weeks INTEGER,
  max_age_weeks INTEGER,
  duration_weeks INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training program weeks table (organize content by week)
CREATE TABLE IF NOT EXISTS public.training_program_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  focus_areas TEXT[], -- e.g., ['foundations', 'skills', 'troubleshooting']
  goals TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- Create training program lessons table (specific lessons within each week)
CREATE TABLE IF NOT EXISTS public.training_program_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES public.training_program_weeks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'foundation', 'skill', 'troubleshooting'
  lesson_type TEXT NOT NULL, -- 'video', 'article', 'exercise', 'interactive'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  estimated_minutes INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  prerequisites TEXT[], -- lesson IDs that should be completed first
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking for training programs
CREATE TABLE IF NOT EXISTS public.user_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  current_week INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, dog_id, program_id)
);

-- Create lesson completion tracking
CREATE TABLE IF NOT EXISTS public.user_lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.training_program_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, dog_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_programs (public read)
CREATE POLICY "Training programs are viewable by everyone"
  ON public.training_programs FOR SELECT
  USING (is_published = true);

-- RLS Policies for training_program_weeks (public read)
CREATE POLICY "Training program weeks are viewable by everyone"
  ON public.training_program_weeks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_programs
      WHERE id = training_program_weeks.program_id
      AND is_published = true
    )
  );

-- RLS Policies for training_program_lessons (public read)
CREATE POLICY "Training program lessons are viewable by everyone"
  ON public.training_program_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_program_weeks w
      JOIN public.training_programs p ON p.id = w.program_id
      WHERE w.id = training_program_lessons.week_id
      AND p.is_published = true
    )
  );

-- RLS Policies for user_training_progress
CREATE POLICY "Users can view their own training progress"
  ON public.user_training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training progress"
  ON public.user_training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress"
  ON public.user_training_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_lesson_completions
CREATE POLICY "Users can view their own lesson completions"
  ON public.user_lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson completions"
  ON public.user_lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson completions"
  ON public.user_lesson_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_training_program_weeks_program ON public.training_program_weeks(program_id);
CREATE INDEX idx_training_program_lessons_week ON public.training_program_lessons(week_id);
CREATE INDEX idx_user_training_progress_user_dog ON public.user_training_progress(user_id, dog_id);
CREATE INDEX idx_user_lesson_completions_user_dog ON public.user_lesson_completions(user_id, dog_id);

-- Add triggers for updated_at
CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_program_weeks_updated_at
  BEFORE UPDATE ON public.training_program_weeks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_program_lessons_updated_at
  BEFORE UPDATE ON public.training_program_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_training_progress_updated_at
  BEFORE UPDATE ON public.user_training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();