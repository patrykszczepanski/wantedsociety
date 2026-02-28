-- ============================================================
-- Fix: RLS recursion on profiles table
-- ============================================================
-- Problem: Admin policies use "EXISTS (SELECT 1 FROM profiles ...)"
-- which causes recursive RLS evaluation on the profiles table itself,
-- silently returning 0 rows → profile always null after login.
--
-- Solution: SECURITY DEFINER function bypasses RLS when checking admin role.
-- ============================================================

-- 1. Create is_admin() function with SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- 2. Replace all recursive admin policies

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (public.is_admin());

-- applications
DROP POLICY IF EXISTS "Admins full access to applications" ON applications;
CREATE POLICY "Admins full access to applications"
  ON applications FOR ALL USING (public.is_admin());

-- application_messages
DROP POLICY IF EXISTS "Admins full access to messages" ON application_messages;
CREATE POLICY "Admins full access to messages"
  ON application_messages FOR ALL USING (public.is_admin());

-- application_photos
DROP POLICY IF EXISTS "Admins full access to application photos" ON application_photos;
CREATE POLICY "Admins full access to application photos"
  ON application_photos FOR ALL USING (public.is_admin());

-- gallery_items
DROP POLICY IF EXISTS "Admins full access to gallery" ON gallery_items;
CREATE POLICY "Admins full access to gallery"
  ON gallery_items FOR ALL USING (public.is_admin());

-- products
DROP POLICY IF EXISTS "Admins full access to products" ON products;
CREATE POLICY "Admins full access to products"
  ON products FOR ALL USING (public.is_admin());

-- product_images
DROP POLICY IF EXISTS "Admins full access to product images" ON product_images;
CREATE POLICY "Admins full access to product images"
  ON product_images FOR ALL USING (public.is_admin());
