-- Create dogs table for pet information
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'checkup', 'medication', 'allergy', 'injury', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  veterinarian TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition_plans table
CREATE TABLE public.nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  food_type TEXT NOT NULL,
  brand TEXT,
  daily_amount DECIMAL(6,2),
  feeding_times INTEGER DEFAULT 2,
  meal_schedule JSONB, -- Store feeding times as JSON array
  special_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tricks table for available tricks/commands
CREATE TABLE public.tricks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('basic', 'intermediate', 'advanced', 'agility', 'fun')),
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_time_weeks INTEGER,
  prerequisites TEXT[], -- Array of prerequisite trick names
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_sessions table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  trick_id UUID NOT NULL REFERENCES public.tricks(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
  notes TEXT,
  progress_status TEXT CHECK (progress_status IN ('not_started', 'learning', 'practicing', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dog_tricks table for tracking which tricks each dog knows
CREATE TABLE public.dog_tricks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  trick_id UUID NOT NULL REFERENCES public.tricks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'learning', 'practicing', 'mastered')),
  started_at TIMESTAMP WITH TIME ZONE,
  mastered_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dog_id, trick_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tricks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_tricks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dogs table
CREATE POLICY "Users can view their own dogs" ON public.dogs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own dogs" ON public.dogs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own dogs" ON public.dogs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own dogs" ON public.dogs FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for health_records table
CREATE POLICY "Users can view health records for their dogs" ON public.health_records FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = health_records.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can insert health records for their dogs" ON public.health_records FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = health_records.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can update health records for their dogs" ON public.health_records FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = health_records.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can delete health records for their dogs" ON public.health_records FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = health_records.dog_id AND dogs.user_id = auth.uid()));

-- RLS Policies for nutrition_plans table
CREATE POLICY "Users can view nutrition plans for their dogs" ON public.nutrition_plans FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = nutrition_plans.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can insert nutrition plans for their dogs" ON public.nutrition_plans FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = nutrition_plans.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can update nutrition plans for their dogs" ON public.nutrition_plans FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = nutrition_plans.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can delete nutrition plans for their dogs" ON public.nutrition_plans FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = nutrition_plans.dog_id AND dogs.user_id = auth.uid()));

-- RLS Policies for tricks table (public read access)
CREATE POLICY "Anyone can view tricks" ON public.tricks FOR SELECT USING (true);

-- RLS Policies for training_sessions table
CREATE POLICY "Users can view training sessions for their dogs" ON public.training_sessions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = training_sessions.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can insert training sessions for their dogs" ON public.training_sessions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = training_sessions.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can update training sessions for their dogs" ON public.training_sessions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = training_sessions.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can delete training sessions for their dogs" ON public.training_sessions FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = training_sessions.dog_id AND dogs.user_id = auth.uid()));

-- RLS Policies for dog_tricks table
CREATE POLICY "Users can view dog tricks for their dogs" ON public.dog_tricks FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = dog_tricks.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can insert dog tricks for their dogs" ON public.dog_tricks FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = dog_tricks.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can update dog tricks for their dogs" ON public.dog_tricks FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = dog_tricks.dog_id AND dogs.user_id = auth.uid()));
CREATE POLICY "Users can delete dog tricks for their dogs" ON public.dog_tricks FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = dog_tricks.dog_id AND dogs.user_id = auth.uid()));

-- Add update triggers for timestamps
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON public.health_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_plans_updated_at BEFORE UPDATE ON public.nutrition_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dog_tricks_updated_at BEFORE UPDATE ON public.dog_tricks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample tricks
INSERT INTO public.tricks (name, category, description, instructions, difficulty_level, estimated_time_weeks, prerequisites) VALUES
('Sit', 'basic', 'Dog sits on command', 'Hold treat above dog''s head, slowly move backwards. When dog sits, say "sit" and reward.', 1, 1, '{}'),
('Stay', 'basic', 'Dog remains in position until released', 'Start with dog in sit position. Hold hand up, say "stay", take one step back. Return and reward.', 2, 2, '{Sit}'),
('Come', 'basic', 'Dog comes when called', 'Start close to dog, say "come" enthusiastically. When dog approaches, reward generously.', 2, 2, '{}'),
('Down', 'basic', 'Dog lies down on command', 'With dog in sit, hold treat to floor between paws. Say "down" when dog lies down.', 2, 2, '{Sit}'),
('Heel', 'intermediate', 'Dog walks beside you without pulling', 'Keep dog on left side, reward when in correct position while walking.', 3, 4, '{Sit,Stay}'),
('Roll Over', 'intermediate', 'Dog rolls over on command', 'Start with dog in down position, hold treat by shoulder and guide in circle motion.', 3, 3, '{Down}'),
('Shake', 'fun', 'Dog offers paw for handshake', 'With dog sitting, gently lift paw while saying "shake", then reward.', 2, 2, '{Sit}'),
('Play Dead', 'fun', 'Dog lies still on side when "shot"', 'From down position, guide dog to lie on side. Use dramatic "bang" gesture.', 4, 4, '{Down,Stay}'),
('Spin', 'fun', 'Dog spins in a circle', 'Hold treat at dog''s nose, slowly guide in circle while saying "spin".', 2, 2, '{}'),
('High Five', 'fun', 'Dog raises paw to meet your hand', 'Similar to shake, but hold hand higher and say "high five".', 2, 2, '{Sit,Shake}');