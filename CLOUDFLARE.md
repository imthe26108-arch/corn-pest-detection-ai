# Cloudflare Workers 部署说明

本项目已适配 Cloudflare Workers + OpenNext。

## 环境变量

在 Cloudflare Workers 项目中配置：

- `AI_BASE_URL`: OpenAI-compatible 服务地址，例如 `https://api.openai.com/v1`
- `AI_API_KEY`: 模型服务密钥，使用 Wrangler Secret 或 Cloudflare Dashboard 保存
- `AI_CHAT_MODEL`: 文本问答模型
- `AI_VISION_MODEL`: 图片识别模型
- `SEARCH_API_URL`: 可选，外部搜索服务地址
- `SEARCH_API_KEY`: 可选，外部搜索服务密钥

本地可参考 `.dev.vars.example`，不要提交真实密钥。

## 推荐部署方式：GitHub Actions

项目已经包含 GitHub Actions 工作流：

```text
.github/workflows/deploy-cloudflare.yml
```

把项目推送到 GitHub 的 `main` 分支后，GitHub 会在 Ubuntu 环境中自动安装依赖、检查代码、构建并部署到 Cloudflare Workers。

### 1. 创建 Cloudflare API Token

在 Cloudflare Dashboard 创建 API Token，至少需要 Workers 部署相关权限。保存生成的 token，后面填到 GitHub Secrets。

还需要 Cloudflare Account ID，可在 Cloudflare Dashboard 右侧栏或账户页面找到。

### 2. 配置 GitHub Secrets

进入 GitHub 仓库：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

添加以下 secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `AI_BASE_URL`
- `AI_API_KEY`
- `AI_CHAT_MODEL`
- `AI_VISION_MODEL`

可选：

- `SEARCH_API_URL`
- `SEARCH_API_KEY`

### 3. 触发部署

推送到 `main` 分支：

```bash
git push origin main
```

也可以在 GitHub Actions 页面手动点击 `Deploy to Cloudflare Workers` 工作流运行。

## 本地部署

```bash
pnpm install
pnpm ts-check
pnpm lint
pnpm deploy
```

本地预览：

```bash
pnpm preview
```

## Windows 注意事项

`@opennextjs/cloudflare` 会提示 Windows 兼容性有限。在当前 Windows 工作区中，OpenNext 构建可能在复制临时配置目录到 `.cf-next/.open-next/.build` 时失败。生产部署建议使用 WSL、Linux CI 或 Cloudflare Workers Builds。

普通 Next.js 构建可用：

```bash
pnpm build
```
