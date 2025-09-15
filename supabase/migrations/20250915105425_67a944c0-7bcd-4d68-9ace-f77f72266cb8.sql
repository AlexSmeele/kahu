-- Create encryption functions for sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text, key_name text DEFAULT 'sensitive_data_key')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- This is a placeholder for encryption - in production you'd use proper encryption
  -- For now, we'll just indicate encrypted data
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  RETURN 'encrypted:' || encode(digest(data || key_name, 'sha256'), 'hex');
END;
$$;

-- Create decryption function (placeholder)
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text, key_name text DEFAULT 'sensitive_data_key')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- This is a placeholder - in production you'd implement proper decryption
  -- For demo purposes, we'll return the original format
  IF encrypted_data IS NULL OR NOT encrypted_data LIKE 'encrypted:%' THEN
    RETURN encrypted_data;
  END IF;
  -- Return placeholder for encrypted data
  RETURN '[ENCRYPTED]';
END;
$$;

-- Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" 
ON public.audit_logs 
FOR SELECT 
USING (false); -- Restrict all access for now

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;