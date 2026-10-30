# SinoFlow - 中文学习平台 (Chinese Language Learning Platform)

SinoFlow 是一个专为报社机构打造的高安全性、模块化在线中文学习平台。基于最新的 **Next.js 15 (App Router)**、**TypeScript** 和 **Prisma** 构建，集成了加密 HLS 视频流播放、模拟支付闭环以及完整的自动化工程体系。

## 🚀 已实现功能 (Features)

### 1. 核心架构与工程化 (Architecture & Engineering)
- [x] **全栈框架**: 采用 Next.js 15 (App Router) + React 19，全面使用 Server Components 优化性能。
- [x] **数据库层**: 集成 Prisma ORM，使用 Docker 容器化运行 PostgreSQL。
- [x] **Service 层架构**: 引入类似 Spring Boot/Angular 的业务逻辑分层（Service Layer），实现 Action 与 DAO 逻辑解耦。
- [x] **自动化测试**: 配置 Vitest 测试框架，实现 38 个核心业务逻辑单元测试。
- [x] **质量守卫**: 集成 Husky + lint-staged，提交代码前自动运行 Lint 检查和相关单元测试。
- [x] **API 文档**: 自动化生成 Swagger/OpenAPI 交互式文档 (访问 `/api-docs`)。
- [x] **代码文档**: 核心逻辑全量补全 JSDoc 标准注释。

### 2. 身份验证与权限 (Auth & RBAC)
- [x] **安全登录**: 使用 Auth.js (NextAuth v5) 实现自定义 Email/Password 登录。
- [x] **密码加密**: 采用 Bcrypt.js 对用户密码进行加盐哈希存储。
- [x] **角色管理**: 实现 RBAC 权限体系（USER / ADMIN）。
- [x] **管理入口**: 智能识别管理员身份，右上角展示专属管理后台入口，支持新页面打开。

### 3. 课程发现与学习 (Course & Learning)
- [x] **多维展示**: 首页（网格视图）与课程中心（列表视图）分离，优化视觉重心。
- [x] **动态搜索**: 支持关键词全文检索与“红黄绿”三级难度实时筛选。
- [x] **视频播放器**: 基于 `hls.js` 实现跨浏览器兼容的 HLS 加密流播放，支持本地 MP4 自动检测。
- [x] **交互式学习**: 章节无刷新自由切换，支持智能自动播放逻辑。
- [x] **试看功能**: 支持管理员针对特定章节开启“免费试看”，未购用户自动拦截。
- [x] **我的学习**: 个人中心展示已购买课程，实现购买后自动解锁。

### 4. 管理后台 (Admin Dashboard)
- [x] **沙盒化设计**: 独立的 Admin Layout，全屏工作台交互。
- [x] **内容管理**: 完整的课程 CRUD（增删改查）功能。
- [x] **自动化处理**: 上传视频时自动调用 FFmpeg 提取第一帧作为课程封面。
- [x] **安全操作**: 删除课程等高危动作需管理员二次输入密码验证。

### 5. 订单与模拟支付 (Orders & Payment)
- [x] **闭环流程**: 实现“下单 -> 模拟支付 -> 自动回调 -> 权限解锁”的全流程 Mock 逻辑。

## 🛠 技术栈 (Tech Stack)

- **Frontend**: React 19, Next.js 15, Lucide Icons, Vanilla CSS
- **Backend**: Next.js Server Actions, Next.js API Routes, Node.js
- **Database**: PostgreSQL (Docker), Prisma ORM
- **Security**: Auth.js, Bcrypt.js
- **Media**: FFmpeg (Local), hls.js
- **Testing**: Vitest, JSDOM

## 🏃 快速开始

### 1. 环境准备
确保您的机器已安装 Node.js, Docker 和 FFmpeg。

### 2. 安装依赖
```bash
npm install --legacy-peer-deps
```

### 3. 启动数据库
```bash
docker-compose up -d
npx prisma db push
npx prisma generate
npx prisma db seed # 预置管理员账号: admin@sinoflow.cn / admin1234
```

### 4. 运行应用
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000)

## 🧪 运行测试
```bash
npm test
```

## 🛠 管理员脚本
- 撤销用户权限: `npx tsx scripts/revoke-access.ts <email>`
