-- Fix function search path security issues
ALTER FUNCTION public.is_family_member(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.is_family_admin(uuid, uuid) SET search_path = public;