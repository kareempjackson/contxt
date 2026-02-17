-- Make user profile creation trigger fail-safe
-- If the trigger errors for any reason, user creation still succeeds

-- 1. Ensure email is nullable
ALTER TABLE user_profiles ALTER COLUMN email DROP NOT NULL;

-- 2. Drop old unique constraint (any name it may have)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_unique;
DROP INDEX IF EXISTS user_profiles_email_unique;

-- 3. Re-create as partial unique index (nulls are not considered duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_unique
  ON user_profiles(email)
  WHERE email IS NOT NULL;

-- 4. Replace trigger function with fail-safe version
--    EXCEPTION block ensures user creation is never blocked by profile errors
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, github_username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'create_user_profile failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
