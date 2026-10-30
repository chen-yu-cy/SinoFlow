#!/usr/bin/env bash
# FILE: scripts/deploy.sh
set -e

echo "🚀 [SinoFlow] 开始一键 Docker 自动化部署检查..."

# 1. 自动检测并生成 .env 配置文件（幂等：如果已存在则绝不覆盖）
if [ ! -f .env ]; then
  echo "⚙️  未检测到 .env 文件，正在自动生成初始配置..."
  
  # 自动生成 32 字节强随机 AUTH_SECRET
  if command -v openssl >/dev/null 2>&1; then
    GENERATED_AUTH_SECRET=$(openssl rand -base64 32)
  else
    GENERATED_AUTH_SECRET="R5vh0RA9bh9lTjZb8S2hpAtsHLCOY4kScJGKarxnahQ="
  fi

  cat <<EOF > .env
# ==============================================================================
# SinoFlow 全局环境变量与预设凭证配置 (由 scripts/deploy.sh 自动生成)
# ==============================================================================

# 1. PostgreSQL 数据库凭证
POSTGRES_USER="devuser"
POSTGRES_PASSWORD="devpassword"
POSTGRES_DB="sinoflow_db"
DATABASE_URL="postgresql://devuser:devpassword@localhost:5432/sinoflow_db?schema=public"

# 2. NextAuth 身份认证与 JWT 签名密钥 (已自动生成随机安全密钥)
AUTH_SECRET="${GENERATED_AUTH_SECRET}"
AUTH_TRUST_HOST="true"

# 3. 网站初始管理员预设账号
ADMIN_EMAIL="admin@sinoflow.cn"
ADMIN_PASSWORD="admin1234"
ADMIN_NAME="Administrator"

# 4. Grafana 日志监控后台预设登录凭证 (http://localhost:3001)
GRAFANA_ADMIN_USER="admin"
GRAFANA_ADMIN_PASSWORD="admin"

# 5. 客服工单通知邮箱与日志级别配置
SUPPORT_EMAIL="support@sinoflow.com"
LOG_LEVEL="info"
EOF

  echo "✅ 已自动创建 .env 配置文件（并生成了随机 AUTH_SECRET）！"
else
  echo "✅ 检测到已有 .env 配置文件，将直接使用现有配置。"
fi

# 2. 读取当前 .env 中的关键信息用于启动后提示
set -a
source .env
set +a

# 3. 启动 Docker Compose 全栈服务
echo "🐳 正在构建并启动 Docker 容器集群 (PostgreSQL + Next.js + Loki + Grafana)..."
docker compose up -d --build

echo ""
echo "=============================================================================="
echo "🎉 SinoFlow 全栈部署已就绪！"
echo "------------------------------------------------------------------------------"
echo "🌐 网站主地址:       http://localhost:3000"
echo "🔑 管理员后台:       http://localhost:3000/admin"
echo "   ├─ 管理员邮箱:    ${ADMIN_EMAIL:-admin@sinoflow.cn}"
echo "   └─ 初始密码:      ${ADMIN_PASSWORD:-admin1234}"
echo "📊 Grafana 监控台:   http://localhost:3001"
echo "   ├─ 监控台账号:    ${GRAFANA_ADMIN_USER:-admin}"
echo "   └─ 监控台密码:    ${GRAFANA_ADMIN_PASSWORD:-admin}"
echo "=============================================================================="
