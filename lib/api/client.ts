// ============================================================================
// API Client for fetching data from our API routes
// ============================================================================

interface ApiResponse<T> {
  data?: T;
  error?: string;
  prompts?: T[];
  skills?: T[];
  categories?: T[];
  tags?: string[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category_id?: string;
  category?: any;
  tags: string[];
  variables?: Record<string, any>;
  is_favorite: boolean;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

interface SkillExample {
  input: string;
  output: string;
  description?: string;
}

interface Skill {
  id: string;
  title: string;
  description: string;
  content: string;  // Claude Code: the main skill prompt/instruction
  category_id?: string;
  category?: any;
  tags: string[];
  parameters: SkillParameter[];  // Claude Code format
  examples: SkillExample[];  // Claude Code format
  is_favorite: boolean;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'prompt' | 'skill';
  color: string;
  icon?: string;
  description?: string;
  is_system: boolean;
}

// Helper to get base URL for server-side fetch
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client side: use relative path
    return '';
  }
  // Server side: use localhost or construct from headers
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000';
}

// ============================================================================
// Prompts API
// ============================================================================

export async function fetchPrompts(params?: {
  category?: string;
  tags?: string[];
  favorite?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ prompts: Prompt[]; total: number; hasMore: boolean }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tags) searchParams.set('tags', params.tags.join(','));
  if (params?.favorite) searchParams.set('favorite', 'true');
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/prompts?${searchParams}`, {
    cache: 'no-store',
  });
  const data = await response.json();

  return {
    prompts: data.prompts || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

export async function createPrompt(prompt: {
  title: string;
  content: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  variables?: Record<string, any>;
  is_public?: boolean;
}): Promise<Prompt> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.prompt;
}

export async function fetchPrompt(id: string): Promise<Prompt> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/prompts/${id}`, {
    cache: 'no-store',
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.prompt;
}

export async function updatePrompt(id: string, updates: {
  title?: string;
  content?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
}): Promise<Prompt> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/prompts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.prompt;
}

export async function deletePrompt(id: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/prompts/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
}

// ============================================================================
// Skills API
// ============================================================================

export async function fetchSkills(params?: {
  category?: string;
  tags?: string[];
  favorite?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ skills: Skill[]; total: number; hasMore: boolean }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tags) searchParams.set('tags', params.tags.join(','));
  if (params?.favorite) searchParams.set('favorite', 'true');
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills?${searchParams}`, {
    cache: 'no-store',
  });
  const data = await response.json();

  return {
    skills: data.skills || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

export async function createSkill(skill: {
  title: string;
  description: string;
  content: string;
  category_id?: string;
  tags?: string[];
  parameters?: SkillParameter[];
  examples?: SkillExample[];
  is_public?: boolean;
}): Promise<Skill> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(skill),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.skill;
}

export async function fetchSkill(id: string): Promise<Skill> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills/${id}`, {
    cache: 'no-store',
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.skill;
}

export async function updateSkill(id: string, updates: {
  title?: string;
  description?: string;
  content?: string;
  category_id?: string;
  tags?: string[];
  parameters?: SkillParameter[];
  examples?: SkillExample[];
  is_favorite?: boolean;
  is_public?: boolean;
}): Promise<Skill> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.skill;
}

export async function deleteSkill(id: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/skills/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
}

// ============================================================================
// Categories API
// ============================================================================

export async function fetchCategories(type?: 'prompt' | 'skill'): Promise<Category[]> {
  const baseUrl = getBaseUrl();
  const url = type ? `${baseUrl}/api/categories?type=${type}` : `${baseUrl}/api/categories`;
  const response = await fetch(url, {
    cache: 'no-store',
  });
  const data = await response.json();
  return data.categories || [];
}

export async function createCategory(category: {
  name: string;
  type: 'prompt' | 'skill';
  color: string;
  description?: string;
  icon?: string;
}): Promise<Category> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.category;
}

export async function updateCategory(id: string, updates: {
  name?: string;
  color?: string;
  description?: string;
  icon?: string;
}): Promise<Category> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
}

// ============================================================================
// Tags API
// ============================================================================

export async function fetchTags(): Promise<string[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/tags`, {
    cache: 'no-store',
  });
  const data = await response.json();
  return data.tags || [];
}

// ============================================================================
// Stats API (for dashboard)
// ============================================================================

export interface DashboardStats {
  promptsCount: number;
  skillsCount: number;
  categoriesCount: number;
  usageCount: number;
  recentPrompts: Prompt[];
  recentSkills: Skill[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Fetch stats in parallel
  const [promptsData, skillsData, categoriesData] = await Promise.all([
    fetchPrompts({ limit: 5 }),
    fetchSkills({ limit: 5 }),
    fetchCategories(),
  ]);

  // Calculate usage count
  const promptsUsage = promptsData.prompts.reduce((sum, p) => sum + p.usage_count, 0);
  const skillsUsage = skillsData.skills.reduce((sum, s) => sum + s.usage_count, 0);

  return {
    promptsCount: promptsData.total,
    skillsCount: skillsData.total,
    categoriesCount: categoriesData.length,
    usageCount: promptsUsage + skillsUsage,
    recentPrompts: promptsData.prompts.slice(0, 3),
    recentSkills: skillsData.skills.slice(0, 3),
  };
}

// Export types
export type { Prompt, Skill, Category, SkillParameter, SkillExample };
