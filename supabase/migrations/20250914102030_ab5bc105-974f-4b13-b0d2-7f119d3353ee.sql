-- Create saved_messages table
CREATE TABLE public.saved_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  conversation_context JSONB,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_reports table
CREATE TABLE public.message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  conversation_context JSONB,
  report_reason TEXT NOT NULL,
  report_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_messages
CREATE POLICY "Users can view their own saved messages" 
ON public.saved_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved messages" 
ON public.saved_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved messages" 
ON public.saved_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved messages" 
ON public.saved_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for message_reports
CREATE POLICY "Users can view their own message reports" 
ON public.message_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message reports" 
ON public.message_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message reports" 
ON public.message_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_saved_messages_updated_at
BEFORE UPDATE ON public.saved_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_reports_updated_at
BEFORE UPDATE ON public.message_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();