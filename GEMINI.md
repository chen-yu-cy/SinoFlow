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
- [ ] **部署与安全**: 引入云端私有存储与 CDN URL 签名鉴权。
  - *目标*: 将视频和封面等媒体资源从本地 `public/uploads` 迁移至云端私有对象存储 (如阿里云 OSS / 腾讯云 COS)，并开启 CDN URL 鉴权防盗链。
  - *实现方案*: 在 Next.js 服务端校验登录及购买状态后，使用共享私钥实时计算并生成带有时效性签名参数 (如 `auth_key`) 的视频播放链接，由 CDN 边缘节点验证合法性并完成内容分发。
  - *价值*: 极大降低服务器磁盘与带宽压力，有效防止视频资源被非法抓包、共享和盗刷。
