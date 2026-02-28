-- Fix: "Database error saving new user" on registration
-- The handle_new_user() trigger needs SET search_path = public
-- to correctly resolve the profiles table in Supabase's environment.

-- 1. Recreate the function with SET search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- 2. Add missing INSERT policy on profiles for the service_role / trigger context
-- This ensures the trigger can insert even if RLS checks apply
CREATE POLICY "Service can create profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);
