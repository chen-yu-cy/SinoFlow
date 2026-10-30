# SinoFlow - 中文学习平台 (Chinese Language Learning Platform)

SinoFlow 是一个专为报社机构打造的高安全性、模块化在线中文学习平台。基于最新的 **Next.js 15 (App Router)**、**TypeScript** 和 **Prisma** 构建，集成了加密 HLS 视频流播放、模拟支付闭环以及完整的自动化工程体系。

## 🚀 已实现功能 (Features)

### 1. 核心架构与工程化 (Architecture & Engineering)
- [x] **全栈框架**: 采用 Next.js 15 (App Router) + React 19，全面使用 Server Components 优化性能。
- [x] **数据库层**: 集成 Prisma ORM，使用 Docker 容器化运行 PostgreSQL。
- [x] **Service 层架构**: 引入类似 Spring Boot/Angular 的业务逻辑分层（Service Layer），实现 Action 与 DAO 逻辑解耦。
- [x] **自动化测试**: 配置 Vitest 测试框架，实现 131 个核心业务逻辑与接口单元测试。
- [x] **质量守卫 & CI/CD**: 集成 Husky + lint-staged 本地守卫，并配置 GitHub Actions 流水线（自动执行 TypeCheck、131 项单元测试、生产构建及 GHCR 镜像发布）。
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

## 🐳 一键 Docker 全栈部署与生产运维 (One-Click Docker & AWS Deployment)

本项目内置了完整的生产级容器化与自动化运维方案（涵盖 **Caddy 自动 HTTPS 反向代理 + Next.js 15 Standalone + PostgreSQL 15 + Loki/Promtail/Grafana 日志监控系统**）。

### 方式一：使用 `deploy.sh` 一键全自动部署（推荐用于全新 AWS EC2 / Lightsail 裸机）

在全新的 **Ubuntu 24.04 LTS / Debian 12** 云服务器或本地机器上，只需克隆仓库并执行一条命令：

```bash
git clone https://github.com/chen-yu-cy/SinoFlow.git
cd SinoFlow

# 模式 A：在服务器本地直接编译并启动所有容器
./scripts/deploy.sh

# 模式 B（推荐线上使用，0% CPU 编译开销）：直接从 GitHub Container Registry (ghcr.io) 拉取预构建镜像并启动
./scripts/deploy.sh --pull
```

**`./scripts/deploy.sh` 会自动完成以下所有初始化工作（幂等安全，可重复执行）：**
1. **Linux 裸机初始化**：自动检测并开启 **2GB Swap 虚拟内存**（防小内存机型 OOM），若系统未安装 `docker` / `docker compose` / `openssl` 则自动调用官方脚本安装并启动守护进程。
2. **自动生成 `.env` 配置**：若目录下不存在 `.env`，自动创建 `.env` 并调用 `openssl rand -base64 32` 生成随机安全的 `AUTH_SECRET`（若已有 `.env` 则直接复用，绝不覆盖）。
3. **自动建表与幂等种子数据注入 (`prisma/seed.mjs`)**：
   - 容器启动时自动执行 `prisma db push` 同步 9 张核心数据库表。
   - **首次启动（空库）**：自动按 `.env` 创建初始管理员账号并注入 2 门演示课程。
   - **后续重启（已有数据）**：自动跳过，绝不覆盖已修改的管理员密码或删除已有课程与订单。
4. **零维护 Grafana 日志监控**：开机自动绑定 Loki 数据源（无需手动配置），并为所有 Docker 容器开启日志自动轮转（单容器上限 `3 × 10MB`），防止日志文件撑爆磁盘。
5. **每日自动数据库备份**：在 Linux 服务器上自动注册每日凌晨 `03:00` 的 `crontab` 定时任务，将数据库备份至 `./backups/` 并自动清理超过 7 天的旧备份。

---

### 方式二：日常快速更新与 Docker Compose 常用命令

当 GitHub Actions 构建并推送了最新镜像到 `ghcr.io/chen-yu-cy/sinoflow` 后，线上服务器无需重新编译代码，5 秒即可完成无感更新：

```bash
# 1. 拉取 GHCR 最新预构建镜像并重启 app 容器（零编译 CPU 消耗）
./scripts/deploy.sh --pull
# 或直接使用原生命令：
docker compose pull app && docker compose up -d --no-build

# 2. 本地修改代码后重新编译构建启动
docker compose up -d --build
```

*(注：若 GitHub 仓库为 Private 私有，首次在服务器上拉取 GHCR 镜像前请先执行一次 `docker login ghcr.io -u chen-yu-cy`，密码输入带有 `read:packages` 权限的 GitHub Personal Access Token)*。

---

### 🔑 全局环境变量与预设凭证说明 (`.env`)

所有数据库密码、管理员预设账号、Grafana 密码及域名配置均集中管理在根目录的 `.env` 文件中（模板见 [`.env.example`](.env.example)）：

| 变量名 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `devuser` / `devpassword` | PostgreSQL 数据库用户名与密码 |
| `POSTGRES_DB` | `sinoflow_db` | PostgreSQL 数据库名称 |
| `AUTH_SECRET` | *(脚本自动生成 32 位随机串)* | NextAuth v5 JWT 签名加密密钥 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@sinoflow.cn` / `admin1234` | 初始管理员登录邮箱与密码 |
| `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` | `admin` / `admin` | Grafana 监控后台 (`:3001`) 登录账号与密码 |
| `DOMAIN_NAME` | `:80` | Caddy 域名配置：默认 `:80` 支持通过服务器 IP (80端口) 直接访问；填写域名（如 `sinoflow.com`）后 Caddy 将**自动申请并续期 Let's Encrypt HTTPS 证书** |
| `APP_IMAGE` | `ghcr.io/chen-yu-cy/sinoflow:latest` | 使用 `--pull` 模式时拉取的预构建镜像地址与版本标签 |

---

### 🌐 服务访问端口与常用运维脚本

| 服务 / 功能 | 访问地址 / 命令 | 说明 |
| :--- | :--- | :--- |
| **网站主入口 (Caddy)** | `http://localhost` (80) / `https://你的域名` (443) | 自动反向代理至 `app:3000`（支持最大 500MB 视频上传） |
| **Next.js 直连端口** | `http://localhost:3000` | 应用容器直连端口 |
| **管理后台** | `http://localhost/admin` | 左下角实时显示当前运行版本号与 Git Commit SHA (如 `v0.1.0 (9525e32)`) |
| **健康检查接口** | `http://localhost/api/health` | 返回数据库连接状态、系统版本号 `version` 与 `commitSha` |
| **Grafana 日志监控台** | `http://localhost:3001` | 登录后进入 `Explore` -> 选择 `Loki` 即可实时检索全站容器日志 |
| **手动备份数据库** | `npm run db:backup` (或 `./scripts/backup.sh`) | 导出并压缩数据库至 `backups/sinoflow_db_时间戳.sql.gz` |
| **从备份恢复数据库** | `./scripts/backup.sh --restore backups/xxx.sql.gz` | 一键将指定的 `.sql.gz` 备份文件还原至 PostgreSQL |
| **强制清空并重置演示数据** | `npm run db:reset` (或 `docker compose exec app npm run db:reset`) | ⚠️ 清空所有课程/课时/资料/订单并恢复为初始 2 门演示课程 |

---

## 💻 本地开发模式 (Local Development without Docker App)

如果您希望在宿主机直接运行 `next dev` 进行热重载开发（仅用 Docker 运行数据库）：

### 1. 环境准备
确保您的机器已安装 Node.js 20+、Docker 和 FFmpeg。

### 2. 安装依赖
```bash
npm install --legacy-peer-deps
```

### 3. 启动数据库并初始化
```bash
docker compose up -d db
npx prisma db push
npx prisma generate
npm run db:seed # 幂等注入管理员账号: admin@sinoflow.cn / admin1234
```

### 4. 运行开发服务器
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
- 一键全栈部署: `./scripts/deploy.sh`
- 数据库备份/恢复: `./scripts/backup.sh`
