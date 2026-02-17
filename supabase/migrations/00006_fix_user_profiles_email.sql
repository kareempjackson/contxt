-- Fix user_profiles to handle GitHub OAuth users with private emails

-- 1. Allow NULL email
ALTER TABLE user_profiles ALTER COLUMN email DROP NOT NULL;

-- 2. Replace UNIQUE(email) constraint with a partial unique index
--    (only enforces uniqueness when email is not null — allows multiple null rows)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;
DROP INDEX IF EXISTS user_profiles_email_unique;
CREATE UNIQUE INDEX user_profiles_email_unique ON user_profiles(email) WHERE email IS NOT NULL;

-- 3. Fix the trigger function to use COALESCE + ON CONFLICT DO NOTHING
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
