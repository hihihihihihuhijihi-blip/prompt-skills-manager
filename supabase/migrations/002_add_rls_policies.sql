-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Categories Policies
-- ============================================================================

-- Users can view their own categories and system categories
CREATE POLICY "Users can view own categories"
    ON public.categories FOR SELECT
    USING (user_id = auth.uid() OR is_system = TRUE);

-- Users can create categories
CREATE POLICY "Users can create categories"
    ON public.categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update own categories
CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete own categories (except system)
CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (user_id = auth.uid() AND is_system = FALSE);

-- ============================================================================
-- Prompts Policies
-- ============================================================================

-- Users can view own prompts and public prompts
CREATE POLICY "Users can view accessible prompts"
    ON public.prompts FOR SELECT
    USING (user_id = auth.uid() OR is_public = TRUE);

-- Users can create prompts
CREATE POLICY "Users can create prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update own prompts
CREATE POLICY "Users can update own prompts"
    ON public.prompts FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete own prompts
CREATE POLICY "Users can delete own prompts"
    ON public.prompts FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- Skills Policies
-- ============================================================================

-- Users can view own skills and public skills
CREATE POLICY "Users can view accessible skills"
    ON public.skills FOR SELECT
    USING (user_id = auth.uid() OR is_public = TRUE);

-- Users can create skills
CREATE POLICY "Users can create skills"
    ON public.skills FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update own skills
CREATE POLICY "Users can update own skills"
    ON public.skills FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete own skills
CREATE POLICY "Users can delete own skills"
    ON public.skills FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- Prompt Versions Policies
-- ============================================================================

-- Users can view versions of their prompts
CREATE POLICY "Users can view own prompt versions"
    ON public.prompt_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.prompts
        WHERE prompts.id = prompt_versions.prompt_id
        AND prompts.user_id = auth.uid()
    ));

-- Users can create versions for their prompts
CREATE POLICY "Users can create prompt versions"
    ON public.prompt_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.prompts
        WHERE prompts.id = prompt_versions.prompt_id
        AND prompts.user_id = auth.uid()
    ));
