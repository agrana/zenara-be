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
