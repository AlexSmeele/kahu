-- Fix the handle_new_user function to properly extract Google OAuth data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'picture',
      NEW.raw_user_meta_data ->> 'avatar_url'
    )
  );
  RETURN NEW;
END;
$$;

-- Update the existing profile to use correct Google OAuth data
UPDATE public.profiles
SET 
  display_name = 'Alex Smeele',
  avatar_url = 'https://lh3.googleusercontent.com/a/ACg8ocL1Ae0WL7kZiirrugOqMQXZa1RWvHR1AKsxTGqoNI4oVvQMyhkM=s96-c',
  updated_at = now()
WHERE id = 'b197063d-9f5b-42c3-888e-3e85e8829141';