-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON public.prompts;
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Function to create prompt version on content change
CREATE OR REPLACE FUNCTION public.create_prompt_version()
RETURNS TRIGGER AS $$
DECLARE
    max_version INTEGER;
BEGIN
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        -- Get the current max version number
        SELECT COALESCE(MAX(version_number), 0) INTO max_version
        FROM public.prompt_versions
        WHERE prompt_id = NEW.id;

        -- Create new version
        INSERT INTO public.prompt_versions (prompt_id, content, version_number, change_note, created_by)
        VALUES (NEW.id, OLD.content, max_version + 1, 'Auto-saved before edit', auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_prompt_version_trigger ON public.prompts;
CREATE TRIGGER create_prompt_version_trigger
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION public.create_prompt_version();

-- Full text search function for prompts
CREATE OR REPLACE FUNCTION public.search_prompts(search_query TEXT, user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    content TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.description,
        p.content,
        ts_rank(to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_query)) AS rank
    FROM public.prompts p
    WHERE p.user_id = user_id
    AND to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Full text search function for skills
CREATE OR REPLACE FUNCTION public.search_skills(search_query TEXT, user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        s.description,
        ts_rank(to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')), plainto_tsquery('english', search_query)) AS rank
    FROM public.skills s
    WHERE s.user_id = user_id
    AND to_tsvector('english', s.title || ' ' || COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, s.created_at DESC;
END;
$$ LANGUAGE plpgsql;
