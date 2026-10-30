#!/usr/bin/env bash
# FILE: scripts/deploy.sh
set -e

echo "🚀 [SinoFlow] 开始一键 Docker 自动化部署检查..."

# ==============================================================================
# 0. Linux (Ubuntu / Debian) 裸机环境自动初始化：Swap 虚拟内存 + Docker 自动安装
# ==============================================================================
if [ "$(uname -s)" = "Linux" ]; then
  # 0.1 自动配置 2GB Swap 虚拟内存（防止 1GB/2GB 小内存 EC2 在构建 Next.js 时 OOM 死机）
  if [ "$(swapon --show | wc -l)" -eq 0 ] && [ ! -f /swapfile ]; then
    echo "🧠 检测到当前 Linux 服务器未开启 Swap 虚拟内存，正在自动创建 2GB Swap..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
    echo "✅ 2GB Swap 虚拟内存创建并启用成功！"
  fi

  # 0.2 自动检测并安装基础工具 (curl, openssl, git)
  if ! command -v curl >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
    echo "📦 正在安装基础依赖工具 (curl, openssl, git, ca-certificates)..."
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update -y && sudo apt-get install -y curl openssl git ca-certificates
    fi
  fi

  # 0.3 自动检测并安装 Docker Engine 与 Docker Compose v2
  if ! command -v docker >/dev/null 2>&1; then
    echo "🐳 未检测到 Docker，正在通过官方脚本自动安装 Docker Engine & Compose 插件..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER" || true
    echo "✅ Docker 安装完成！"
  fi

  # 确保 Docker 服务正在运行
  if ! sudo systemctl is-active --quiet docker; then
    sudo systemctl start docker
  fi
fi

# 判断运行 docker 是否需要 sudo（首次加入 docker 用户组但未重新登录 SSH 时自动回退使用 sudo）
DOCKER_CMD="docker"
if ! docker info >/dev/null 2>&1; then
  if sudo docker info >/dev/null 2>&1; then
    DOCKER_CMD="sudo docker"
  else
    echo "❌ Docker 守护进程未运行，请先启动 Docker！"
    exit 1
  fi
fi

# ==============================================================================
# 1. 自动检测并生成 .env 配置文件（幂等：如果已存在则绝不覆盖）
# ==============================================================================
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

# ==============================================================================
# 2. 读取当前 .env 中的关键信息用于启动后提示
# ==============================================================================
set -a
source .env
set +a

# ==============================================================================
# 3. 启动 Docker Compose 全栈服务
# ==============================================================================
echo "🐳 正在构建并启动 Docker 容器集群 (PostgreSQL + Next.js + Loki + Grafana)..."
$DOCKER_CMD compose up -d --build

# 自动探测公网 IP（如果在云服务器上则显示公网 IP，否则显示 localhost）
PUBLIC_HOST="localhost"
if [ "$(uname -s)" = "Linux" ]; then
  DETECTED_IP=$(curl -s --max-time 2 http://checkip.amazonaws.com || true)
  if [ -n "$DETECTED_IP" ]; then
    PUBLIC_HOST="$DETECTED_IP"
  fi
fi

echo ""
echo "=============================================================================="
echo "🎉 SinoFlow 全栈部署已就绪！"
echo "------------------------------------------------------------------------------"
echo "🌐 网站主地址:       http://${PUBLIC_HOST}:3000"
echo "🔑 管理员后台:       http://${PUBLIC_HOST}:3000/admin"
echo "   ├─ 管理员邮箱:    ${ADMIN_EMAIL:-admin@sinoflow.cn}"
echo "   └─ 初始密码:      ${ADMIN_PASSWORD:-admin1234}"
echo "📊 Grafana 监控台:   http://${PUBLIC_HOST}:3001"
echo "   ├─ 监控台账号:    ${GRAFANA_ADMIN_USER:-admin}"
echo "   └─ 监控台密码:    ${GRAFANA_ADMIN_PASSWORD:-admin}"
echo "=============================================================================="
