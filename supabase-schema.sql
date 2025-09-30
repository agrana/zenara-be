-- Create prompts table for prompt management system
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_template_type ON prompts(template_type);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own prompts and default prompts
CREATE POLICY "Users can view their own prompts and defaults" ON prompts
  FOR SELECT USING (
    user_id = auth.uid() OR is_default = true
  );

-- Users can only insert their own prompts
CREATE POLICY "Users can create their own prompts" ON prompts
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Users can only update their own prompts
CREATE POLICY "Users can update their own prompts" ON prompts
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Users can only delete their own prompts
CREATE POLICY "Users can delete their own prompts" ON prompts
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Note Versions Table
-- ============================================
-- Tracks version history for all notes
CREATE TABLE IF NOT EXISTS note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL, -- References scratchpad note ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT NOT NULL, -- diary, meeting, brainstorm, etc.
  version_number INTEGER NOT NULL,
  is_processed BOOLEAN DEFAULT false, -- true if this version was created by AI processing
  processing_metadata JSONB, -- stores model, prompt type, etc. if processed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON note_versions(note_id);
CREATE INDEX IF NOT EXISTS idx_note_versions_user_id ON note_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_note_versions_created_at ON note_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_versions_note_created ON note_versions(note_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own note versions
CREATE POLICY "Users can view their own note versions" ON note_versions
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Users can only insert their own note versions
CREATE POLICY "Users can create their own note versions" ON note_versions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Users can delete their own note versions
CREATE POLICY "Users can delete their own note versions" ON note_versions
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Function to automatically clean up old versions
-- Keeps only the last N versions per note (default: 10)
CREATE OR REPLACE FUNCTION cleanup_old_note_versions()
RETURNS TRIGGER AS $$
DECLARE
  max_versions INTEGER := 10; -- Configurable limit
  versions_to_delete UUID[];
BEGIN
  -- Get versions to delete (keep only the most recent max_versions)
  SELECT ARRAY_AGG(id) INTO versions_to_delete
  FROM (
    SELECT id
    FROM note_versions
    WHERE note_id = NEW.note_id
    ORDER BY created_at DESC
    OFFSET max_versions
  ) old_versions;
  
  -- Delete old versions if any
  IF versions_to_delete IS NOT NULL THEN
    DELETE FROM note_versions
    WHERE id = ANY(versions_to_delete);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically cleanup old versions after insert
CREATE TRIGGER cleanup_note_versions_after_insert
  AFTER INSERT ON note_versions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_note_versions();
