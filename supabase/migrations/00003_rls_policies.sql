-- MemoCore Row-Level Security Policies
-- Ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usage Tracking Policies
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role');

-- Projects Policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Branches Policies
CREATE POLICY "Users can view branches of their projects"
  ON branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = branches.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create branches in their projects"
  ON branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = branches.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update branches in their projects"
  ON branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = branches.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete branches in their projects"
  ON branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = branches.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Memory Entries Policies
CREATE POLICY "Users can view entries in their projects"
  ON memory_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memory_entries.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries in their projects"
  ON memory_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memory_entries.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries in their projects"
  ON memory_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memory_entries.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries in their projects"
  ON memory_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = memory_entries.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Memory Versions Policies
CREATE POLICY "Users can view versions of their entries"
  ON memory_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memory_entries
      JOIN projects ON projects.id = memory_entries.project_id
      WHERE memory_entries.id = memory_versions.entry_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage versions"
  ON memory_versions FOR ALL
  USING (auth.role() = 'service_role');

-- Sync Metadata Policies
CREATE POLICY "Users can view sync metadata for their projects"
  ON sync_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sync_metadata.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage sync metadata for their projects"
  ON sync_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sync_metadata.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON usage_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON branches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON memory_entries TO authenticated;
GRANT SELECT ON memory_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_metadata TO authenticated;
