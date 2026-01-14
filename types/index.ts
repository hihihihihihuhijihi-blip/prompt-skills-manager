// ============================================================================
// Database Models
// ============================================================================

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'prompt' | 'skill';
  color: string;
  icon?: string;
  description?: string;
  user_id: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  prompts_count?: number;
  skills_count?: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category_id?: string;
  tags: string[];
  variables?: Record<string, Variable>;
  is_favorite: boolean;
  is_public: boolean;
  usage_count: number;
  user_id: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Variable {
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  default?: string | number | boolean;
  description?: string;
  required?: boolean;
  options?: string[];
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  tags: string[];
  parameters?: Record<string, Parameter>;
  examples?: Example[];
  is_favorite: boolean;
  is_public: boolean;
  usage_count: number;
  user_id: string;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Parameter {
  type: string;
  required: boolean;
  description: string;
  default?: unknown;
}

export interface Example {
  input: Record<string, unknown>;
  output: unknown;
  description?: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  content: string;
  version_number: number;
  change_note?: string;
  created_by?: string;
  created_at: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  favorite?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  sort?: 'created' | 'updated' | 'title' | 'usage';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// UI Types
// ============================================================================

export type ViewMode = 'grid' | 'list';
export type ExportFormat = 'json' | 'csv' | 'markdown';
export type ImportStatus = 'idle' | 'parsing' | 'validating' | 'importing' | 'done' | 'error';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ============================================================================
// Supabase Generated Types
// ============================================================================

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Category>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Prompt>;
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Skill>;
      };
      prompt_versions: {
        Row: PromptVersion;
        Insert: Omit<PromptVersion, 'id' | 'created_at'>;
        Update: Partial<PromptVersion>;
      };
    };
  };
};
