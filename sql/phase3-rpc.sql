-- Phase 3: RPC function for public coach lookup by referral code.
-- Already deployed in Supabase (Phase 1). This file is for documentation only.
--
-- This function uses SECURITY DEFINER to bypass coaches_own_row RLS,
-- exposing ONLY the coach name — no email, revenue data, or auth_user_id.

CREATE OR REPLACE FUNCTION public.get_coach_by_code(coach_code TEXT)
RETURNS TABLE (name TEXT) AS $$
  SELECT name FROM coaches WHERE LOWER(code) = LOWER(coach_code) LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
