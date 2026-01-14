-- ============================================================================
-- Prompt Skills Manager Database Schema
-- Supabase PostgreSQL Migration
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
-- Indexes for better query performance
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
CREATE INDEX IF NOT EXISTS idx_prompts_search ON public.prompts USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(description, '')));

-- Skills indexes
CREATE INDEX IF NOT EXISTS idx_skills_user ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON public.skills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_favorite ON public.skills(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_skills_created ON public.skills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_search ON public.skills USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Prompt versions indexes
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON public.prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_number ON public.prompt_versions(prompt_id, version_number);
