-- ============================================================================
-- Tags Table
-- ============================================================================
-- This table allows independent tag management separate from prompts/skills
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tag lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_user ON public.tags(user_id);

-- ============================================================================
-- RLS Policies for tags table
-- ============================================================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Users can view all tags
CREATE POLICY "Anyone can view tags"
    ON public.tags FOR SELECT
    USING (true);

-- Users can create their own tags
CREATE POLICY "Users can create tags"
    ON public.tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete own tags"
    ON public.tags FOR DELETE
    USING (auth.uid() = user_id AND is_system = FALSE);

-- System tags cannot be deleted
