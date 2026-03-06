-- Prevent users from self-updating plan_id on user_profiles.
-- Only service_role (webhook + server-side verification) should be able to change it.

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Re-create with a WITH CHECK that ensures plan_id cannot be changed by the user.
-- Service role bypasses RLS entirely, so webhook/settings updates are unaffected.
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan_id = (SELECT plan_id FROM user_profiles WHERE id = auth.uid())
  );
