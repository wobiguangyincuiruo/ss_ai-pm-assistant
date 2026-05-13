# 数字员工 — AI 产品经理助手

面向业务人员的 AI 协作平台，内置多个"数字员工"技能，通过对话式交互完成需求分析、会议纪要整理等结构化文档输出。

## 核心能力

| 能力 | 说明 |
|------|------|
| **多技能数字员工** | 内置产品需求分析助手、Pro全需求分析、会议纪要整理助手，每个技能有独立的角色设定和输出模板 |
| **双模式运行** | Mock 模式（内置对话演示，无需 API Key）和 API 模式（接入真实大模型） |
| **多厂商支持** | 支持 Anthropic (Claude)、DeepSeek、OpenAI 及自定义 API 端点 |
| **结构化输出** | AI 对话结果实时渲染到右侧输出面板，每个技能定义专属章节结构 |
| **PRD 自动保存** | 输出内容自动保存为本地 Markdown 文件（`prds/` 目录） |
| **会话持久化** | 对话历史自动保存至 localStorage + 文件系统，支持历史加载、继续分析、删除管理 |
| **技能热插拔** | 向 `src/data/skills/` 目录添加 `.md` 文件即可注册新技能，无需修改代码 |
| **可拖拽面板** | 左侧历史面板、中间对话区、右侧输出面板均支持拖拽调整宽度 |

## 技术栈

- **前端**：React 18 + TypeScript + Vite 5
- **状态管理**：useReducer + Context（无第三方依赖）
- **Markdown 渲染**：react-markdown + Mermaid 图表
- **后端代理**：Express（生产环境 API 代理 + 静态文件服务）
- **文档导出**：docx 库（Word 文档导出）
- **样式方案**：内联 CSS-in-JS（React.CSSProperties）

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与开发

```bash
# 克隆仓库
git clone https://github.com/wobiguangyincuiruo/ss_ai-pm-assistant.git
cd ss_ai-pm-assistant

# 安装依赖
npm install

# 启动开发服务器（含 HMR）
npm run dev
```

开发服务器启动后访问 `http://localhost:3000`。

### 生产构建与部署

```bash
# 类型检查 + 构建
npm run build

# 启动生产服务
npm start
```

生产服务会在 `http://localhost:3000` 启动，自动托管 `dist/` 静态文件并提供 API 代理。可通过 `PORT` 环境变量修改端口：

```bash
PORT=8080 npm start
```

### 目录结构

```
ai-pm-assistant/
├── src/
│   ├── components/
│   │   ├── ChatPanel/          # 对话面板（消息列表 + 输入区 + 打字动画）
│   │   ├── Header/             # 顶栏（技能选择、模式切换、API Key 配置）
│   │   ├── HistoryPanel/       # 历史记录侧边栏
│   │   ├── OutputPanel/        # 结构化输出面板
│   │   └── ResizeHandle.tsx    # 拖拽分隔条
│   ├── context/AppContext.tsx   # 全局状态管理
│   ├── data/skills/            # 技能定义目录（添加 .md 文件即可注册新技能）
│   ├── hooks/                  # useChat、useSessions 自定义 Hook
│   ├── services/               # API 调用、本地存储、文档导出
│   └── types/index.ts          # TypeScript 类型定义
├── server.js                   # Express 生产服务器
├── vite.config.ts              # Vite 配置（含开发代理 + 文件端点）
├── sessions/                   # 会话历史文件（自动生成）
├── prds/                       # PRD 文档输出（自动生成）
└── dist/                       # 构建产物
```

## 使用指南

### 1. 选择技能与模式

顶部栏左侧显示当前技能名称，点击右侧下拉可选择不同的数字员工技能。通过"演示/API"切换按钮选择运行模式：

- **演示模式**：使用内置模拟对话体验功能，无需任何 API Key
- **API 模式**：连接真实大模型进行智能分析

### 2. 配置 API

在 API 模式下需要配置：

| 配置项 | 说明 |
|--------|------|
| API 提供商 | Anthropic / DeepSeek / OpenAI / 自定义 |
| 模型 ID | 如 `claude-sonnet-4-20250514`、`deepseek-chat`、`gpt-4o` |
| API Key | 从对应厂商获取的密钥 |
| 自定义端点 | 仅"自定义"模式下需要，如 `https://api.example.com` |

API Key 仅存储在浏览器内存中，不会写入 localStorage 或服务器。

### 3. 对话交互

- 在底部输入框输入需求，**Enter** 发送，**Shift+Enter** 换行
- AI 会根据当前技能的角色设定进行引导式对话
- 右侧输出面板会实时更新结构化的分析结果

### 4. 历史记录

点击顶部栏左侧 **☰** 按钮打开历史面板：

- 所有会话按更新时间倒序排列
- 搜索框可过滤历史会话
- 点击会话卡片恢复完整对话和输出
- 加载后可继续发送消息，AI 会基于完整上下文回复
- 悬停显示删除按钮

### 5. 新建会话

点击顶部右侧"新会话"按钮即可开始全新的对话。当前会话会自动保存到历史记录中。

## 添加新技能

只需在 `src/data/skills/` 目录下创建一个 `.md` 文件：

```markdown
---json
{
  "id": "my-skill",
  "name": "我的数字员工",
  "description": "一句话描述这个技能做什么",
  "hasMock": false,
  "openingMessage": "您好！请描述您的需求...",
  "outputLabel": "文档",
  "outputs": [
    { "id": 1, "title": "1. 章节一" },
    { "id": 2, "title": "2. 章节二" }
  ]
}
---

# 角色定位
你是一位...（系统提示词，定义 AI 的行为和输出格式）
```

保存文件后重启开发服务器即可生效。如需内置模拟对话，在 `mock-dialogues.json` 中添加对应的对话数据并将 `hasMock` 设为 `true`。

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识符 |
| `name` | string | 是 | 显示名称 |
| `description` | string | 是 | 功能描述 |
| `hasMock` | boolean | 是 | 是否支持演示模式 |
| `openingMessage` | string | 是 | 开场白（AI 主动发送的第一条消息） |
| `outputLabel` | string | 否 | 输出文档标签（影响保存文件名） |
| `outputs` | array | 是 | 输出章节列表，每个包含 `id`（序号）和 `title`（章节标题） |
