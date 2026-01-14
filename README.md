# Prompt Skills Manager

一个专业的 AI 提示词和技能管理平台。

## 功能特性

- **提示词管理** - 创建、编辑、删除和组织你的 AI 提示词
- **技能管理** - 定义和管理 AI 技能
- **分类标签** - 使用分类和标签组织内容
- **搜索过滤** - 快速查找你需要的提示词或技能
- **版本管理** - 自动保存提示词的历史版本
- **导入导出** - 支持 JSON、CSV、Markdown 格式

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **UI 组件**: Radix UI
- **图标**: Lucide React
- **状态管理**: Zustand

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写你的 Supabase 配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. 设置 Supabase 数据库

在 Supabase Dashboard 的 SQL Editor 中运行 `supabase/migrations` 目录下的迁移文件：

1. `001_initial_schema.sql` - 创建数据库表
2. `002_add_rls_policies.sql` - 设置行级安全策略
3. `003_add_functions_triggers.sql` - 创建函数和触发器
4. `004_seed_data.sql` - 插入系统分类数据

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
prompt-skills-manager/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由
│   ├── (dashboard)/              # 主应用路由
│   ├── api/                      # API 路由
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   ├── dashboard/                # 仪表板组件
│   ├── prompts/                  # 提示词组件
│   ├── skills/                   # 技能组件
│   ├── ui/                       # UI 基础组件
│   └── ...
├── lib/                          # 工具库
│   ├── auth/                     # 认证工具
│   └── utils/                    # 通用工具
├── supabase/migrations/          # 数据库迁移
├── types/                        # TypeScript 类型
└── public/                       # 静态资源
```

## 数据库模型

### 表结构

- **categories** - 分类表
- **prompts** - 提示词表
- **skills** - 技能表
- **prompt_versions** - 提示词版本历史表

## API 路由

- `GET/POST /api/prompts` - 提示词列表/创建
- `GET/POST /api/skills` - 技能列表/创建
- `GET/POST /api/categories` - 分类列表/创建
- `GET /api/tags` - 所有标签

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行 ESLint
```

## 设计系统

### 配色

- Primary: `#2563EB` (蓝色)
- Secondary: `#3B82F6` (浅蓝)
- CTA: `#F97316` (橙色)
- Background: `#F8FAFC`
- Text: `#1E293B`

### 字体

- 标题: Poppins
- 正文: Open Sans
- 代码: JetBrains Mono

## 许可证

MIT
