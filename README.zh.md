[English](README.md) | [中文](README.zh.md)

# Chef Kitty

一个由 AI 驱动的食谱推荐应用。输入你手头的食材，即可获得由 Groq LLM API 生成的定制食谱。支持英文、中文和西班牙文。

[![Demo](./media/demo-video.gif)](./media/demo.mp4)

## ▶️ 在线演示

<a href="https://gotham-citizen.github.io/Chef-Kitty/">
  <img src="./media/demo.png" alt="Chef Kitty 截图" width="600">
</a>

点击上方图片或[此处](https://gotham-citizen.github.io/Chef-Kitty/)体验！

## 快速开始

### 前置条件

- Node.js (v18+)
- Groq API 密钥（[在此申请](https://console.groq.com/keys)）

### 安装

```bash
npm install
```

在项目根目录创建 `.env` 文件：

```
VITE_WORKER_URL=https://your-worker-url.workers.dev
```

### 本地 Worker 配置

Groq API 密钥保存在 [Cloudflare Worker](https://dash.cloudflare.com/login) 中，不会暴露给客户端。

1. 进入 `worker/` 目录，创建 `.dev.vars` 文件：

```
GROQ_API_KEY=your_groq_api_key_here
```

2. 本地启动 Worker：

```bash
npx wrangler dev
```

3. 在项目根目录的 `.env` 中将 `VITE_WORKER_URL` 设为 `http://localhost:8787`。

### 部署 Worker

```bash
npx wrangler deploy
```

然后将 `GROQ_API_KEY` 设为 Secret：

```bash
npx wrangler secret put GROQ_API_KEY
```

### 本地运行

```bash
npm run dev
```

访问 `http://localhost:5173`。

### 构建生产版本

```bash
npm run build
npm run preview
```

## 功能特性

- **食材自动补全** — 输入时从精选的三语食材列表（`src/ingredients.js`）中显示建议，支持键盘导航；建议始终跟随浏览器/界面语言；无完全匹配时通过 Levenshtein 距离做模糊匹配，可容错拼写错误（如输入 `chiken` 会提示 `chicken`）
- **相似食材检测** — 使用 Levenshtein 距离计算相似度，添加新食材时若与已添加食材相似度 ≥ 0.8 会提示重复（如 `tomatos` 会被判定为与 `tomatoes` 重复）
- **AI 生成食谱** — 至少添加 4 种食材后，点击 **生成食谱**
- **食谱历史** — 最近生成的 5 条食谱自动保存到 `localStorage`
- **收藏食谱** — 最多收藏 50 条食谱；收藏时会触发彩带与猫咪表情包庆祝动画 🎉
- **食谱标签与筛选** — 可为收藏的食谱添加、编辑、重命名和删除自定义标签（如 `快速`、`辣`），并通过标签进行筛选
- **重复检测** — 如果同一组食材已生成过食谱，可查看已有食谱或生成一份不同的
- **三语界面与 AI 回复** — 界面跟随浏览器语言，AI 会使用你输入食材的语言回复

## 工作原理

1. 在表单中输入食材并添加到列表中（带自动补全建议）。
2. 当食材达到 4 种后，点击 **生成食谱**。
3. 应用将食材发送到 Cloudflare Worker，Worker 将请求代理至 Groq API（`openai/gpt-oss-20b`），并使用严格模式（Structured Outputs）保证响应符合 JSON Schema。
4. AI 返回 Markdown 格式的食谱，渲染在页面上。
5. 食谱会自动保存到历史记录；你可以收藏喜欢的食谱并随时查看。

## 技术栈

### 前端

- **React 19** — UI 组件与 Hooks
- **Vite** — 开发服务器与构建工具
- **react-markdown** — 将 AI 返回的 Markdown 渲染为 HTML
- **i18next + react-i18next** — 完整的国际化框架，支持浏览器语言检测；翻译文件位于 `src/utils/locales/{en,zh,es}/translation.js`

### 后端 / 基础设施

- **Groq REST API** — AI 食谱生成，通过 `fetch` 直接调用 `openai/gpt-oss-20b`（`strict: true` JSON Schema，无需 SDK）
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — 无服务器 API 代理（服务端保存 Groq API 密钥）
- **Wrangler** — Cloudflare Workers 命令行工具，用于本地开发与部署
- **GitHub Actions** — CI/CD 流水线，自动构建并部署到 GitHub Pages

## 项目结构

```
├── index.html                  # HTML 入口
├── vite.config.js              # Vite 配置
├── eslint.config.js            # ESLint 扁平配置
├── styles/
│   └── index.css               # 全局样式
├── src/
│   ├── index.jsx               # React 挂载点
│   ├── App.jsx                 # 根组件（历史/收藏弹窗状态）
│   ├── ai.js                   # API 客户端（向 Worker 发起 fetch）
│   ├── ingredients.js          # 三语自动补全食材列表
│   └── utils/
│       ├── i18n.js             # i18next 初始化 + detectInputLanguage()
│       ├── levenshtein.js      # Levenshtein 距离、相似度计算
│       ├── pinyin.js           # 中文自动补全的拼音/首字母转换
│       ├── useLocalStorage.js  # 基于 localStorage 的状态 Hook
│       └── locales/
│           ├── en/translation.js   # 英文翻译
│           ├── zh/translation.js   # 中文翻译
│           └── es/translation.js   # 西班牙文翻译
├── components/
│   ├── Header.jsx              # Logo、标题、历史/收藏按钮
│   ├── Main.jsx                # 食材表单、状态与食谱逻辑
│   ├── IngredientsList.jsx     # 食材列表与"生成食谱"按钮
│   ├── KittyRecipe.jsx         # 食谱渲染组件
│   ├── RecipesModal.jsx         # 历史/收藏食谱弹窗
│   ├── SavedLimitModal.jsx     # 收藏数量已满时的替换弹窗
│   ├── RecipeViewer.jsx        # 全屏食谱查看弹窗
│   ├── CelebrationEffect.jsx   # 彩带 + 猫咪表情包动画
│   └── Icons.jsx               # 共享 SVG 图标
├── worker/                     # Cloudflare Worker（API 代理）
│   ├── worker.js               # Worker 逻辑：CORS、验证、Groq 调用
│   ├── prompts.js              # 系统/用户提示词模板（英中西文）
│   ├── wrangler.toml           # Wrangler 配置
│   ├── .dev.vars               # 本地密钥（已 gitignore）
│   └── .dev.vars.example       # 本地密钥模板
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
└── media/
    ├── chef_kitten.png         # Logo
    ├── demo.png
    ├── demo.mp4
    ├── demo-video.gif
    └── cat-meme/               # 庆祝动画使用的猫咪表情包图片
```

## 语言支持

应用会自动检测浏览器语言设置，在英文、中文和西班牙文之间切换。自动补全建议始终跟随浏览器/界面语言；AI 会根据你输入食材的语言回复（通过 `detectInputLanguage()` 检测）。

| 语言   | 界面检测                        | AI 回复检测                             |
| ------ | ------------------------------- | --------------------------------------- |
| 英语   | `navigator.language` 以 `en` 开头 | 食材匹配 `INGREDIENTS.en`；否则回退     |
| 中文   | `navigator.language` 以 `zh` 开头 | 食材中包含 CJK 字符                     |
| 西班牙文 | `navigator.language` 以 `es` 开头 | 食材含 `ñáéíóúü` 或匹配 `INGREDIENTS.es`；否则回退 |

AI 回复语言会优先根据食材文本判断：先看是否含 CJK 字符，再看是否含西班牙语专属字符，最后在西班牙语与英语食材词库之间投票。若食材无法识别或票数打平，则回退到界面语言。

如需添加新语言，请在 `src/utils/locales/` 下添加翻译文件，在 `src/utils/i18n.js` 中注册，在 `src/ingredients.js` 中补充对应语言的食材列表，并更新 `worker/prompts.js` 中的提示词模板。

## 安全说明

Groq API 密钥保存在 [Cloudflare Worker](https://dash.cloudflare.com/login) 服务端（通过 `wrangler secret put` 或 `.dev.vars` 设置）。客户端只知道 Worker 的 URL。CORS 配置仅允许来自开发服务器和生产环境 GitHub Pages 域名的请求。