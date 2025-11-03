-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Lifestyle profiles table
CREATE TABLE public.lifestyle_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    household_adults INTEGER NOT NULL DEFAULT 0,
    household_children INTEGER NOT NULL DEFAULT 0,
    household_seniors INTEGER NOT NULL DEFAULT 0,
    home_type TEXT NOT NULL CHECK (home_type IN ('apartment', 'house', 'rural')),
    outdoor_space TEXT NOT NULL CHECK (outdoor_space IN ('none', 'small', 'large')),
    weekday_hours_away INTEGER NOT NULL DEFAULT 0,
    weekend_hours_away INTEGER NOT NULL DEFAULT 0,
    activity_level TEXT NOT NULL CHECK (activity_level IN ('low', 'medium', 'high')),
    experience TEXT NOT NULL CHECK (experience IN ('first_time', 'some', 'experienced')),
    allergies BOOLEAN NOT NULL DEFAULT false,
    budget_monthly_nzd INTEGER NOT NULL DEFAULT 0,
    travel_frequency TEXT NOT NULL CHECK (travel_frequency IN ('rare', 'sometimes', 'often')),
    preferences JSONB NOT NULL DEFAULT '{}',
    target_timeline_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lifestyle_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lifestyle profile"
ON public.lifestyle_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lifestyle profile"
ON public.lifestyle_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lifestyle profile"
ON public.lifestyle_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Course modules table
CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    estimated_minutes INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    tags JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are viewable by everyone"
ON public.course_modules FOR SELECT TO authenticated
USING (is_published = true);

-- Lessons table
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    lesson_type TEXT NOT NULL CHECK (lesson_type IN ('read', 'video', 'scenario', 'dragdrop', 'match', 'imagespot', 'calculator')),
    content JSONB NOT NULL DEFAULT '{}',
    order_index INTEGER NOT NULL,
    personalization_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by everyone"
ON public.lessons FOR SELECT TO authenticated
USING (true);

-- Quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('checkpoint', 'final')),
    pass_percentage INTEGER NOT NULL DEFAULT 80,
    pull_from_tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes are viewable by everyone"
ON public.quizzes FOR SELECT TO authenticated
USING (true);

-- Questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'tf', 'shorttext', 'image_mcq', 'sequence', 'case')),
    stem TEXT NOT NULL,
    choices JSONB,
    correct_answer TEXT,
    rationale TEXT,
    weight INTEGER NOT NULL DEFAULT 1,
    tags JSONB NOT NULL DEFAULT '[]',
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone"
ON public.questions FOR SELECT TO authenticated
USING (true);

-- User progress table
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    completed_lessons JSONB NOT NULL DEFAULT '[]',
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    best_score_pct INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    mastered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, module_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
ON public.user_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.user_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.user_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    score_pct INTEGER NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    tag_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
ON public.quiz_attempts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name_on_cert TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    score_pct INTEGER NOT NULL,
    badge_tier TEXT NOT NULL CHECK (badge_tier IN ('standard', 'gold', 'platinum')),
    share_url TEXT,
    pdf_url TEXT,
    readiness_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Certificates are publicly viewable by share URL"
ON public.certificates FOR SELECT TO anon
USING (share_url IS NOT NULL);

CREATE POLICY "Users can insert own certificates"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Recommendations table
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    dog_profiles JSONB NOT NULL DEFAULT '[]',
    next_steps JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
ON public.recommendations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
ON public.recommendations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Badges table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_type)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
ON public.badges FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
ON public.badges FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_lifestyle_profiles_user_id ON public.lifestyle_profiles(user_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_badges_user_id ON public.badges(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lifestyle_profiles_updated_at
BEFORE UPDATE ON public.lifestyle_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();