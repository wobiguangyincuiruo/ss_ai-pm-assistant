# 产品经理 AI 助理 — 前端 Demo 设计文档

## 概览

基于 `product-requirement-analyst.md` Skill，实现一个对话式 AI 需求分析前端界面。面向不懂 AI 技术的业务人员，通过 4 步苏格拉底式问答引导完成需求分析，最终输出结构化 PRD 文档。

**技术栈**: React 18 + TypeScript + Vite + mermaid.js

**双模式**: 演示模式（Mock 预设对话） / API 模式（真实 Claude API）

---

## 启动方式

```bash
cd ai-pm-assistant
npm install
npm run dev      # 开发模式，访问 http://localhost:3000
npm run build    # 生产构建
```

---

## 界面布局

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  [Title] [Step1→Step2→Step3→Step4]  [Mock|API] [Key] [+] │
├────────────────────────────┬────────────────────────────┤
│                            │                             │
│   Chat Panel (60%)         │   PRD Panel (40%)           │
│                            │                             │
│   ┌──────────────────┐    │   ┌─────────────────────┐   │
│   │ AI: 开场白...      │    │   │ 产品需求文档         │   │
│   └──────────────────┘    │   │ ▸ 1. 背景与目标       │   │
│           ┌──────────┐    │   │ ▾ 2. 用户角色         │   │
│           │ 用户回答   │    │   │   客服专员...         │   │
│           └──────────┘    │   │ ▸ 3. 当前业务流程     │   │
│   ┌──────────────────┐    │   │   ...                 │   │
│   │ AI: 追问...       │    │   └─────────────────────┘   │
│   └──────────────────┘    │                             │
│   ... (typing)            │                             │
│                            │                             │
│   ┌────────────────────────┐                             │
│   │ 输入框              [发送]│                             │
│   └────────────────────────┘                             │
└────────────────────────────┴────────────────────────────┘
```

---

## 核心交互流程

```
新会话启动
  → 自动发送开场白（AI 第一条消息）
  → 用户在输入框输入回答，Enter 发送
  → Mock 模式：按预设对话树顺序返回下一条 AI 消息
  → API 模式：将历史消息发送给 Claude API，返回 AI 回复
  → AI 回复中提取 PRD 章节内容，实时更新右侧面板
  → 步骤进度条根据对话进度自动推进
```

---

## 文件结构

```
src/
├── index.tsx                          # 入口
├── App.tsx                            # 主组件 + 自动开场白逻辑
├── types/index.ts                     # 所有 TS 类型定义
├── context/AppContext.tsx             # 全局状态 (Context + useReducer)
├── hooks/
│   ├── useChat.ts                     # 对话编排器（核心 Hook）
│   └── useAutosize.ts                 # Textarea 自适应高度
├── services/
│   ├── mockEngine.ts                  # Mock 对话引擎
│   ├── claudeApi.ts                   # Claude API 调用封装
│   └── stepClassifier.ts             # 步骤推断 + PRD 章节解析
├── data/
│   ├── mockDialogue.ts                # 预设对话树（客服投诉分类场景）
│   └── systemPrompt.ts               # Skill 定义作为 System Prompt
├── components/
│   ├── Header/
│   │   ├── Header.tsx                 # 顶部栏容器
│   │   ├── StepProgressIndicator.tsx  # 4 步进度指示器
│   │   ├── ModeToggle.tsx             # Mock/API 切换按钮
│   │   └── APIKeyInput.tsx            # API Key 输入框
│   ├── ChatPanel/
│   │   ├── ChatPanel.tsx              # 聊天面板容器
│   │   ├── MessageList.tsx            # 消息列表（支持 Markdown）
│   │   ├── TypingIndicator.tsx        # "AI 正在分析..."动画
│   │   └── InputArea.tsx              # 输入框 + 发送按钮
│   └── PRDPanel/
│       ├── PRDPanel.tsx               # PRD 面板（折叠章节 + 导出）
│       └── MermaidDiagram.tsx         # Mermaid 流程图渲染
└── styles/global.css                  # 全局样式 + 滚动条
```

---

## 状态管理

使用 React Context + useReducer，单一状态树：

| 字段 | 类型 | 说明 |
|------|------|------|
| `mode` | `'mock' \| 'api'` | 当前运行模式 |
| `apiKey` | `string` | Anthropic API Key（API 模式） |
| `currentStep` | `1 \| 2 \| 3 \| 4` | 当前对话步骤 |
| `messages` | `Message[]` | 完整对话历史 |
| `prd` | `PRD` | 8 个章节的 PRD 数据 |
| `isTyping` | `boolean` | AI 是否正在回复 |
| `sessionId` | `string` | 会话 ID（新会话时重新生成） |

**Reducer Actions**: `SET_MODE`, `SET_API_KEY`, `SET_CURRENT_STEP`, `ADD_MESSAGE`, `SET_TYPING`, `UPDATE_PRD_SECTION`, `NEW_SESSION`

---

## Mock 对话树

预设了一个完整的"客服投诉邮件自动分类"业务场景，共 12 轮对话：

| 轮次 | 步骤 | AI 消息 | PRD 更新 |
|------|------|---------|----------|
| 1 | 步骤1 | 开场白：描述最耗时任务 | - |
| 2 | 步骤2 | 追问：用哪些文件/信息 | - |
| 3 | 步骤2 | 追问：固定重复步骤 | - |
| 4 | 步骤2 | 追问：查找/比对数据 | - |
| 5 | 步骤2 | 追问：输出结果、谁用 | 更新第1-3节 |
| 6 | 步骤3 | 维度1：重复劳动 | - |
| 7 | 步骤3 | 维度2：固定规则 | - |
| 8 | 步骤3 | 维度3：信息整合 | - |
| 9 | 步骤3 | 维度4：预测建议 | - |
| 10 | 步骤4 | 共识确认 | - |
| 11 | 步骤4 | 生成完整 PRD | 更新第4-8节 |
| 12+ | - | 结束语 | - |

Mock 引擎工作方式：统计历史中 assistant 消息数量，返回对话树中对应索引的内容。用户输入的具体文字不影响对话推进。

---

## API 模式

- 直接从浏览器调用 Anthropic Messages API
- System Prompt 使用 `product-requirement-analyst.md` 的完整内容
- 步骤推断：对 AI 回复做关键词匹配（不依赖 LLM 输出结构化数据）
- PRD 解析：正则匹配 `## N. 标题` 格式提取对应章节

---

## PRD 8 章节说明

| 编号 | 标题 | 内容类型 |
|------|------|----------|
| 1 | 背景与目标 | 业务场景、痛点、预期收益 |
| 2 | 用户角色 | 主要使用者画像 |
| 3 | 当前业务流程 | 步骤文字 + Mermaid 流程图 |
| 4 | AI 能力介入点 | 输入/处理逻辑/输出 |
| 5 | 功能需求 | 用户故事格式 |
| 6 | 数据与接口需求 | 输入输出数据字段 |
| 7 | 非功能需求 | 响应速度、准确率、可解释性 |
| 8 | 验收标准 | 可操作的检查清单 |

章节在对话过程中逐步填充（步骤2完成时填充1-3节，步骤4完成时填充4-8节），支持折叠/展开浏览，支持导出为 Markdown 文件。

---

## 设计决策

| 决策 | 理由 |
|------|------|
| Context + useReducer（非 Redux/Zustand） | 单页 Demo，无需中间件和 devtools |
| Mock 线性推进（非分支对话树） | 确保演示稳定可预测 |
| Inline Styles（非 CSS Modules/Tailwind） | 组件自包含，方便拷贝到其他项目 |
| 直接浏览器调用 Anthropic API | Demo 简化，无需后端代理 |
| 仅 4 个运行时依赖 | 最小化复杂度，专注核心逻辑 |
| 新会话自动发送开场白 | 匹配 Skill "请直接以第一步的开场白开始" |
