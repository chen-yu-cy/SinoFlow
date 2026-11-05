# Role & Context
You are an expert Senior Full-Stack Engineer specializing in Next.js 15 (App Router), React, TypeScript, and database optimization. 
We are building an online Chinese Language Learning Platform for a newspaper organization. The platform requires high type-safety, modular structure, and integration with domestic Chinese payment gateways (WeChat/Alipay) and encrypted HLS video streaming.

# General Instruction for Gemini CLI
- Act as a headless code generator. Minimize conversational filler ("Sure!", "Here is the code").
- Go straight to file creation.
- ALWAYS specify the absolute file path before each code block using the format: `// FILE: path/to/file.ts`
- If code is truncated due to length limits, stop and ask me to type "continue".
- Before performing any `git commit`, ALWAYS provide a detailed summary of the changes and obtain explicit user approval.
- Whenever a `git commit` is requested, ALWAYS evaluate if new unit tests are required for the changes or if existing tests need to be updated, and propose these test changes before finalizing the commit.
- **PR Review & Feature 深度审查规范**: 在特性分支开发完成并准备提交 PR Review 时，严禁直接询问是否合并。必须站在资深全栈架构师角度进行深度推演和边界审查（包括安全性、边界限制、格式校验、关联页面一致性、极端体验等），主动向用户列出“可进一步优化的潜在点”，与用户充分探讨、征询意见并按需完善后，方可进行最终的 `main` 分支 Merge。
- ALWAYS run `npx prisma db push` and `npx prisma generate` immediately after modifying `prisma/schema.prisma` to ensure database and type synchronization.

# 语言规范 & 编码标准 (Coding Specifications)
You must strictly adhere to the following code quality rules:

1. **TypeScript Strictness**:
   - `strict: true` is enabled. NEVER use `any`. Use `unknown` if the type is uncertain, or define precise `type` / `interface`.
   - All API Route Handlers must have explicitly typed Request and Response structures.
   - Use Prisma-generated types for database entities.

2. **Next.js 15 & React Architectural Rules**:
   - Default to **Server Components** for data fetching and static layout to optimize performance.
   - Use `"use client"` ONLY when React hooks (`useState`, `useEffect`), browser APIs, or interactive event handlers are strictly required.
   - Use Next.js 15 `fetch` with appropriate caching strategies (`cache: 'force-cache'` or `next: { revalidate: ... }`).
   - Use Async/Await over Promises `.then()/.catch()`.

3. **Naming & Style Conventions**:
   - Components: Functional components using Arrow Functions (`const MyComponent = () => ...`). Naming: `PascalCase`.
   - Hooks: `camelCase` prefixed with `use` (e.g., `usePaymentStatus`).
   - File/Folder names: `kebab-case` (except for Next.js special files like `layout.tsx`, `page.tsx`, `route.ts`).
   - Database/API payloads: `camelCase` for JSON boundaries, matched with Prisma schema conventions.

4. **Error & Response Handling**:
   - All Route Handlers must wrap core logic in `try-catch` blocks.
   - Return semantic HTTP status codes (200 for OK, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden, 500 for Server Error).
   - Use `NextResponse.json({ success: false, error: "Message" }, { status: ... })` for backend errors.

# Target Project Structure
```text
src/
├── app/
│   ├── layout.tsx               # Global Root Layout
│   ├── page.tsx                 # Homepage (Course List)
│   ├── courses/[id]/page.tsx    # Course Detail & Video Player (Client/Server hybrid)
│   └── api/
│       └── payment/
│           ├── route.ts          # Order creation endpoint
│           └── callback/route.ts # Webhook listener (Requires raw body string via req.text() for WeChat signature verification)
├── components/
│   ├── ui/                      # Atomic UI elements
│   └── course/                  # Video player & course components
├── lib/
│   ├── actions/                 # Server Actions (Web entry points & Security guards)
│   ├── services/                # Service Layer (Business logic & DAO operations)
│   ├── db/client.ts             # Prisma client singleton
│   └── payment/                 # WeChat & Alipay SDK integration helpers
├── scripts/                     # Administrative utility scripts (CLI entry points)
└── types/                       # Shared type definitions

# 项目积压任务 (Backlog)
- [x] **高优先级**: 修复课程封面缩略图显示异常问题。
  - *现象*: 数据库中已有图片路径且文件存在于 `public/uploads`，但前端页面（首页/列表页）依然显示占位符或“暂无封面”。
  - *尝试过的方案*: 强制动态渲染 (`force-dynamic`)、清理 Next.js 缓存、脚本批量修复数据。
  - *待调研*: Next.js 15 图片静态资源服务的路径映射问题。
- [x] **中优先级**: 将用户与认证领域逻辑重构至 `UserService`。
  - *目标*: 将 `registerUser` 和 `verifyAdminPassword` 中的加密与数据库写入逻辑从 Action 层迁往 `lib/services/user.service.ts`。
  - *价值*: 实现密码处理逻辑的集中管理，提升可测试性，并为未来多平台（Web/CLI）复用打下基础。
- [x] **存储与视频体系**: 引入 S3/OSS 兼容对象存储与客户端预签名直传 (方案一)。
  - *目标*: 彻底摆脱服务器本地磁盘存储瓶颈，实现大视频文件直通云端私有存储，并开启 CDN URL 签名鉴权防盗链。
  - *实现方案*:
    1. **直传接口**: 新增 `POST /api/admin/upload/presign`，服务端校验 ADMIN 权限后签发有时效性的 S3 预签名直传 URL (Presigned PUT URL)。
    2. **前端体验**: 管理员后台上传视频时，利用 HTML5 `<video>` + `<canvas>` 本地秒级提取第一帧封面与时长，并通过预签名 URL 直接推送到云端存储桶，配备 0%~100% 真实上传进度条。
    3. **播放鉴权**: 在 Next.js 播放端校验登录与课程购买状态，使用共享私钥实时生成带有时效性签名参数 (如 `auth_key`) 的视频播放链接，由 CDN 边缘节点验证合法性并完成内容分发。
  - *价值*: 极大降低服务器磁盘与带宽压力（Next.js 服务器 0 带宽消耗），支持超大文件稳定上传与进度展示，并有效防止音视频资源被非法抓包和盗刷。
- [x] **运维与部署**: 实现零私钥按需版本分发 Pipeline (`.github/workflows/deploy.yml`)。
  - *目标*: 彻底摆脱服务器 SSH 私钥在 CI 上的凭据暴露风险，通过 GHCR 镜像标签指针晋级与 Watchtower 轮询，支持随时回滚或部署任意 Git Commit Hash、Release Tag 或分支。
  - *价值*: 0 私钥托管、0 端口开放、秒级指针晋级（无需重复下载镜像层），与 Watchtower 自动部署 100% 深度协同。
- [ ] **运维与通知**: Watchtower 自动部署集成 Telegram 通知。
  - *目标*: 当 Watchtower 检测到 GHCR 新镜像并完成自动更新重启后，通过 Shoutrrr 自动向指定的 Telegram 机器人/群组发送部署通知。
  - *配置项*: 在 `docker-compose.yml` 中支持 `WATCHTOWER_NOTIFICATIONS=shoutrrr` 与 `WATCHTOWER_NOTIFICATION_URL=telegram://<bot-token>@telegram/?channels=<chat-id>`。
  - *价值*: 团队和开发者无需手动登录服务器或轮询查看 health 接口，即可第一时间获知生产环境的更新状态。
