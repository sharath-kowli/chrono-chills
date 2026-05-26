
-- 1. Lock down entitlements: explicitly deny client writes
CREATE POLICY "No client inserts on entitlements" ON public.entitlements
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client updates on entitlements" ON public.entitlements
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on entitlements" ON public.entitlements
  FOR DELETE TO anon, authenticated USING (false);

-- 2. Lock down user_roles: explicitly deny client writes (prevent privilege escalation)
CREATE POLICY "No client inserts on user_roles" ON public.user_roles
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No client updates on user_roles" ON public.user_roles
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on user_roles" ON public.user_roles
  FOR DELETE TO anon, authenticated USING (false);

-- 3. Revoke EXECUTE on has_role from public roles. It's used inside RLS policies
--    (which run as the policy owner), so revoking client EXECUTE doesn't break RLS.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 4. Tighten "Anyone can insert events" — replace WITH CHECK (true) with validation
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND length(session_id) BETWEEN 1 AND 128
    AND length(event_type) BETWEEN 1 AND 64
    AND length(page) BETWEEN 1 AND 512
    AND length(country) BETWEEN 1 AND 64
  );
