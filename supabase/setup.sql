-- ============================================================================
-- Prompt Skills Manager - Complete Database Setup
-- 在 Supabase SQL Editor 中运行此脚本
-- https://supabase.com/dashboard/project/xujdckzwhtqyljcqlymv/sql/new
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Categories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('prompt', 'skill')),
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Prompts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    variables JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Skills Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    examples JSONB DEFAULT '[]',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Prompt Versions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    change_note TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Prompts indexes
CREATE INDEX IF NOT EXISTS idx_prompts_user ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON public.prompts(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON public.prompts(created_at DESC);

-- Skills indexes
CREATE INDEX IF NOT EXISTS idx_skills_user ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON public.skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_favorite ON public.skills(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_skills_created ON public.skills(created_at DESC);

-- Prompt versions indexes
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON public.prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_number ON public.prompt_versions(prompt_id, version_number);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view own categories"
    ON public.categories FOR SELECT
    USING (user_id = auth.uid() OR is_system = TRUE);

CREATE POLICY "Users can create categories"
    ON public.categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
    ON public.categories FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
    ON public.categories FOR DELETE
    USING (user_id = auth.uid() AND is_system = FALSE);

-- Prompts Policies
CREATE POLICY "Users can view accessible prompts"
    ON public.prompts FOR SELECT
    USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can create prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prompts"
    ON public.prompts FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own prompts"
    ON public.prompts FOR DELETE
    USING (user_id = auth.uid());

-- Skills Policies
CREATE POLICY "Users can view accessible skills"
    ON public.skills FOR SELECT
    USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can create skills"
    ON public.skills FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own skills"
    ON public.skills FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own skills"
    ON public.skills FOR DELETE
    USING (user_id = auth.uid());

-- Prompt Versions Policies
CREATE POLICY "Users can view own prompt versions"
    ON public.prompt_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.prompts
        WHERE prompts.id = prompt_versions.prompt_id
        AND prompts.user_id = auth.uid()
    ));

CREATE POLICY "Users can create prompt versions"
    ON public.prompt_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.prompts
        WHERE prompts.id = prompt_versions.prompt_id
        AND prompts.user_id = auth.uid()
    ));

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
        SELECT COALESCE(MAX(version_number), 0) INTO max_version
        FROM public.prompt_versions
        WHERE prompt_id = NEW.id;

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

-- ============================================================================
-- Seed Data (System Categories)
-- ============================================================================

-- Insert system categories for prompts
INSERT INTO public.categories (name, type, color, icon, description, is_system)
SELECT * FROM (VALUES
    ('写作助手', 'prompt', '#3B82F6', 'pen-tool', '用于各种写作任务的提示词模板', TRUE),
    ('代码开发', 'prompt', '#10B981', 'code', '编程和开发相关的提示词', TRUE),
    ('数据分析', 'prompt', '#8B5CF6', 'bar-chart', '数据分析和可视化提示词', TRUE),
    ('创意设计', 'prompt', '#F97316', 'palette', '创意和设计相关的提示词', TRUE),
    ('学习研究', 'prompt', '#06B6D4', 'book-open', '学习和研究辅助提示词', TRUE),
    ('产品管理', 'prompt', '#EC4899', 'layers', '产品管理和运营提示词', TRUE)
) AS v(name, type, color, icon, description, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE name = v.name AND type = v.type
);

-- Insert system categories for skills
INSERT INTO public.categories (name, type, color, icon, description, is_system)
SELECT * FROM (VALUES
    ('数据处理', 'skill', '#3B82F6', 'database', '数据处理和转换技能', TRUE),
    ('API 集成', 'skill', '#10B981', 'plug', '第三方服务集成技能', TRUE),
    ('自动化', 'skill', '#8B5CF6', 'zap', '自动化工作流技能', TRUE),
    ('文件操作', 'skill', '#F97316', 'file', '文件读写和处理技能', TRUE),
    ('AI 交互', 'skill', '#06B6D4', 'cpu', 'AI 模型交互技能', TRUE)
) AS v(name, type, color, icon, description, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE name = v.name AND type = v.type
);

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify setup
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Prompts', COUNT(*) FROM public.prompts
UNION ALL
SELECT 'Skills', COUNT(*) FROM public.skills
UNION ALL
SELECT 'Prompt Versions', COUNT(*) FROM public.prompt_versions;
