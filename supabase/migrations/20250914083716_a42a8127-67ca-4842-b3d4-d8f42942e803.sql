-- Create families table for household groups
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table for user relationships to families
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create family_invitations table for pending invites
CREATE TABLE public.family_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, email)
);

-- Enable RLS on all family tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Family policies: Users can view/manage families they belong to
CREATE POLICY "Users can view their families" 
ON public.families 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = families.id 
    AND family_members.user_id = auth.uid()
    AND family_members.status = 'active'
  )
);

CREATE POLICY "Users can create families" 
ON public.families 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family admins can update families" 
ON public.families 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = families.id 
    AND family_members.user_id = auth.uid()
    AND family_members.role = 'admin'
    AND family_members.status = 'active'
  )
);

-- Family members policies
CREATE POLICY "Users can view family members of their families" 
ON public.family_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid()
    AND fm.status = 'active'
  )
);

CREATE POLICY "Users can join families via invitation" 
ON public.family_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Family admins can manage members" 
ON public.family_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid()
    AND fm.role = 'admin'
    AND fm.status = 'active'
  )
);

CREATE POLICY "Family admins can remove members" 
ON public.family_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm 
    WHERE fm.family_id = family_members.family_id 
    AND fm.user_id = auth.uid()
    AND fm.role = 'admin'
    AND fm.status = 'active'
  )
);

-- Family invitations policies
CREATE POLICY "Users can view invitations for their families" 
ON public.family_invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = family_invitations.family_id 
    AND family_members.user_id = auth.uid()
    AND family_members.status = 'active'
  )
);

CREATE POLICY "Family admins can send invitations" 
ON public.family_invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = family_invitations.family_id 
    AND family_members.user_id = auth.uid()
    AND family_members.role = 'admin'
    AND family_members.status = 'active'
  )
);

CREATE POLICY "Family admins can update invitations" 
ON public.family_invitations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = family_invitations.family_id 
    AND family_members.user_id = auth.uid()
    AND family_members.role = 'admin'
    AND family_members.status = 'active'
  )
);

-- Update dogs table to support family sharing
ALTER TABLE public.dogs ADD COLUMN family_id UUID REFERENCES public.families(id);

-- Update dogs RLS policies to include family access
CREATE POLICY "Family members can view family dogs" 
ON public.dogs 
FOR SELECT 
USING (
  family_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = dogs.family_id 
    AND family_members.user_id = auth.uid()
    AND family_members.status = 'active'
  )
);

CREATE POLICY "Family members can update family dogs" 
ON public.dogs 
FOR UPDATE 
USING (
  family_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = dogs.family_id 
    AND family_members.user_id = auth.uid()
    AND family_members.role IN ('admin', 'member')
    AND family_members.status = 'active'
  )
);

-- Create function to automatically create family for new users
CREATE OR REPLACE FUNCTION public.create_user_family()
RETURNS TRIGGER AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create a personal family for the user
  INSERT INTO public.families (name, created_by)
  VALUES (COALESCE(NEW.display_name, 'My Family'), NEW.id)
  RETURNING id INTO new_family_id;
  
  -- Add user as admin of their family
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, NEW.id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create family for new profiles
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_family();

-- Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for families
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for family_members
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();