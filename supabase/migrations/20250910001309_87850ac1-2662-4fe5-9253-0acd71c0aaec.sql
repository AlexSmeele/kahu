-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dog_id UUID,
  type TEXT NOT NULL, -- 'feeding_reminder', 'vaccination_due', 'vet_appointment', 'weight_check', 'general'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  action_url TEXT, -- Optional URL for navigation when clicked
  metadata JSONB, -- Additional data specific to notification type
  scheduled_for TIMESTAMP WITH TIME ZONE, -- When the notification should be shown
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for updated_at column
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Insert some sample notifications for testing
INSERT INTO public.notifications (user_id, type, title, message, priority, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'vaccination_due', 'Vaccination Due', 'Rabies vaccination is due for your dog in 2 weeks', 'high', '{"vaccine_name": "Rabies", "due_date": "2024-10-01"}'),
('550e8400-e29b-41d4-a716-446655440000', 'feeding_reminder', 'Feeding Time', 'It''s time for your dog''s evening meal', 'normal', '{"meal_type": "dinner", "suggested_amount": "1.5 cups"}'),
('550e8400-e29b-41d4-a716-446655440000', 'weight_check', 'Weight Check Reminder', 'It''s been 2 weeks since the last weight check', 'normal', '{"last_weight": "25.5", "last_date": "2024-09-01"}'),
('550e8400-e29b-41d4-a716-446655440000', 'general', 'Welcome to PawPal!', 'Track your dog''s health, training, and nutrition all in one place', 'low', '{}');