-- ============================================================================
-- Update Skills Table for Claude Code Compatibility
-- ============================================================================

-- Add content column for the actual skill prompt/instruction
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS content TEXT;

-- Update parameters structure to support Claude Code format
-- parameters should be: [{ name, type, description, required, default }]
ALTER TABLE public.skills ALTER COLUMN parameters SET DEFAULT '[]'::jsonb;

-- Update examples structure to support Claude Code format
-- examples should be: [{ input, output, description }]
ALTER TABLE public.skills ALTER COLUMN examples SET DEFAULT '[]'::jsonb;

-- Add index for content search
CREATE INDEX IF NOT EXISTS idx_skills_content ON public.skills USING GIN(to_tsvector('english', COALESCE(content, '')));

-- Add comment for documentation
COMMENT ON COLUMN public.skills.content IS 'The main skill prompt/instruction content (Claude Code compatible)';
COMMENT ON COLUMN public.skills.parameters IS 'Skill parameters in Claude Code format: [{name, type, description, required, default}]';
COMMENT ON COLUMN public.skills.examples IS 'Skill examples in Claude Code format: [{input, output, description}]';
