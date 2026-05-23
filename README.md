# AI Middle Station MVP

这是一个使用 Next.js + OpenRouter 的 AI 中转站最小版本。第一版目标是先跑通一个简单的 AI Chat：前端页面负责输入和展示，后端 `/api/chat` 负责安全调用 OpenRouter。

## 当前功能

- 首页：介绍项目和入口
- Chat 页面：支持多轮聊天、loading、错误提示、清空聊天、Enter 发送
- `/api/chat` 后端接口：前端通过自己的后端接口调用 AI
- OpenRouter API 调用：使用 `openai/gpt-4o-mini`
- `.env.local` 环境变量：API Key 只放在本地环境变量里

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- OpenRouter API

## 本地运行

先安装依赖：

```bash
npm install
```

启动本地开发服务器：

```bash
npm run dev
```

打开页面：

- 首页：http://127.0.0.1:3000
- Chat 页面：http://127.0.0.1:3000/chat

## 环境变量

项目需要 OpenRouter API Key。请在项目根目录创建 `.env.local` 文件：

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

注意：

- 不要把真实 API Key 上传到 GitHub。
- `.env.local` 应该被 `.gitignore` 忽略。
- 修改 `.env.local` 后，需要重启 `npm run dev`。

## 测试和检查

运行代码检查：

```bash
npm.cmd run lint
```

运行生产构建检查：

```bash
npm.cmd run build
```

手动测试 Chat：

1. 打开 http://127.0.0.1:3000/chat
2. 输入一句测试内容，例如：
   `Hello, please reply with one short sentence.`
3. 点击 `Send` 或按 Enter。
4. 确认 AI 有回复。

## Vercel 部署

1. 把代码上传到 GitHub。
2. 在 Vercel 里选择 `Import Project`。
3. 选择这个 GitHub 仓库。
4. 在 Vercel 的 `Environment Variables` 里添加：

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

5. 点击 `Deploy`。
6. 部署完成后，打开线上 `/chat` 页面测试聊天功能。

## 项目结构

```text
src/app/page.tsx          首页
src/app/chat/page.tsx     Chat 页面
src/app/api/chat/route.ts 后端聊天接口
.env.local.example        环境变量示例
```
