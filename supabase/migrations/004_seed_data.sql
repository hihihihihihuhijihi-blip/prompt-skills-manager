-- ============================================================================
-- Seed Data
-- ============================================================================

-- Insert system categories for prompts
INSERT INTO public.categories (name, type, color, icon, description, is_system)
SELECT * FROM (VALUES
    ('写作助手', 'prompt', '#3B82F6', 'pen-tool', '用于各种写作任务的提示词模板'),
    ('代码开发', 'prompt', '#10B981', 'code', '编程和开发相关的提示词'),
    ('数据分析', 'prompt', '#8B5CF6', 'bar-chart', '数据分析和可视化提示词'),
    ('创意设计', 'prompt', '#F97316', 'palette', '创意和设计相关的提示词'),
    ('学习研究', 'prompt', '#06B6D4', 'book-open', '学习和研究辅助提示词'),
    ('产品管理', 'prompt', '#EC4899', 'layers', '产品管理和运营提示词')
) AS v(name, type, color, icon, description, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE name = v.name AND type = v.type
);

-- Insert system categories for skills
INSERT INTO public.categories (name, type, color, icon, description, is_system)
SELECT * FROM (VALUES
    ('数据处理', 'skill', '#3B82F6', 'database', '数据处理和转换技能'),
    ('API 集成', 'skill', '#10B981', 'plug', '第三方服务集成技能'),
    ('自动化', 'skill', '#8B5CF6', 'zap', '自动化工作流技能'),
    ('文件操作', 'skill', '#F97316', 'file', '文件读写和处理技能'),
    ('AI 交互', 'skill', '#06B6D4', 'cpu', 'AI 模型交互技能')
) AS v(name, type, color, icon, description, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE name = v.name AND type = v.type
);
