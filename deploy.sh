#!/bin/bash
set -e

# ============================================================================
# 昆明龙虾局 - PM2 部署脚本
# 使用方式: bash deploy.sh [setup|update|restart|stop|status|logs|nginx]
# ============================================================================

APP_NAME="lobster-nexus"
DOMAIN="xia.qiweiban.com"
PORT=3200
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
NGINX_LINK="/etc/nginx/sites-enabled/$APP_NAME"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[部署]${NC} $1"; }
warn() { echo -e "${YELLOW}[警告]${NC} $1"; }
err()  { echo -e "${RED}[错误]${NC} $1"; }
info() { echo -e "${CYAN}[信息]${NC} $1"; }

# ============================================================================
# 检查系统环境
# ============================================================================
check_env() {
  if ! command -v pnpm &> /dev/null; then
    log "安装 pnpm..."
    npm install -g pnpm
  fi
  log "pnpm $(pnpm -v) ✓"

  if ! command -v pm2 &> /dev/null; then
    log "安装 PM2..."
    npm install -g pm2
  fi
  log "PM2 $(pm2 -v) ✓"
}

# ============================================================================
# 安装依赖 + 构建
# ============================================================================
build_app() {
  log "安装依赖..."
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install

  log "生成 Prisma Client..."
  npx prisma generate

  log "同步数据库..."
  npx prisma db push

  log "构建 Next.js 应用..."
  pnpm build
}

# ============================================================================
# 首次部署 (setup)
# ============================================================================
setup() {
  log "=========================================="
  log "  🦞 昆明龙虾局 - 首次部署"
  log "=========================================="
  echo ""

  check_env
  mkdir -p logs

  if [ ! -f ".env" ]; then
    warn ".env 文件不存在，正在创建模板..."
    create_env_template
    echo ""
    err "请先编辑配置文件: .env"
    err "填入数据库、OSS 等正确配置后，重新运行:"
    echo ""
    echo "  bash deploy.sh setup"
    echo ""
    exit 1
  fi

  build_app

  log "启动应用（PM2）..."
  pm2 start ecosystem.config.js
  pm2 save

  log "设置 PM2 开机自启..."
  pm2 startup 2>/dev/null || warn "请手动运行 pm2 startup 输出的命令来设置开机自启"
  pm2 save

  echo ""
  log "=========================================="
  log "  🦞 部署完成！应用运行在 http://localhost:$PORT"
  log "=========================================="
  echo ""
  info "管理命令:"
  info "  bash deploy.sh update    更新代码并重新构建"
  info "  bash deploy.sh restart   零停机重启"
  info "  bash deploy.sh status    查看运行状态"
  info "  bash deploy.sh logs      实时查看日志"
  info "  bash deploy.sh nginx     自动配置 Nginx + SSL"
  echo ""
  pm2 list
}

# ============================================================================
# 更新部署 (update)
# ============================================================================
update() {
  log "=========================================="
  log "  🦞 昆明龙虾局 - 更新部署"
  log "=========================================="
  echo ""

  check_env
  build_app

  log "重启应用（PM2 彻底清理 + 重新启动）..."
  pm2 delete "$APP_NAME" 2>/dev/null || true
  pm2 kill 2>/dev/null || true
  sleep 1
  pm2 start ecosystem.config.js
  pm2 save

  echo ""
  log "更新完成！"
  pm2 list
}

# ============================================================================
# 管理命令
# ============================================================================
do_restart() {
  log "零停机重启..."
  pm2 reload "$APP_NAME"
  sleep 2
  pm2 list
}

do_status() {
  pm2 list
  echo ""
  pm2 show "$APP_NAME" 2>/dev/null || warn "应用未运行"
}

do_logs() {
  pm2 logs "$APP_NAME" --lines 100
}

do_stop() {
  log "停止应用..."
  pm2 stop "$APP_NAME"
  pm2 list
}

# ============================================================================
# 创建 .env 模板
# ============================================================================
create_env_template() {
  cat > ".env" << 'ENVEOF'
# ============================================================================
# 昆明龙虾局 - 环境变量配置
# ============================================================================

# 数据库 (MySQL)
DATABASE_URL="mysql://lobster:your_password@127.0.0.1:3306/lobster_nexus"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_USER="lobster"
DB_PASSWORD="your_password"
DB_NAME="lobster_nexus"

# 应用配置
NEXT_PUBLIC_BASE_URL="https://xia.qiweiban.com"
ADMIN_PASSWORD="0413"
NODE_ENV="production"
PORT=3200

# 阿里云 OSS
OSS_ACCESS_KEY_ID=""
OSS_ACCESS_KEY_SECRET=""
OSS_BUCKET=""
OSS_REGION="cn-beijing"
OSS_RAM_ROLE_ARN=""
ENVEOF

  log "已创建 .env 模板: .env"
}

# ============================================================================
# Nginx 配置 - 自动写入并申请 SSL
# ============================================================================
setup_nginx() {
  log "=========================================="
  log "  Nginx 配置 - $DOMAIN"
  log "=========================================="
  echo ""

  if ! command -v nginx &> /dev/null; then
    err "Nginx 未安装！请先安装: apt install nginx"
    exit 1
  fi

  log "写入 Nginx 配置 (HTTP)..."
  cat > "$NGINX_CONF" << NGINXEOF
upstream ${APP_NAME}_upstream {
    server 127.0.0.1:${PORT};
    keepalive 64;
}

server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    location /_next/static/ {
        proxy_pass http://${APP_NAME}_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://${APP_NAME}_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGINXEOF

  if [ ! -L "$NGINX_LINK" ]; then
    ln -s "$NGINX_CONF" "$NGINX_LINK"
    log "已创建符号链接: $NGINX_LINK"
  else
    log "符号链接已存在"
  fi

  log "测试 Nginx 配置..."
  nginx -t || { err "Nginx 配置测试失败！"; exit 1; }
  systemctl reload nginx
  log "Nginx 已重载 ✓"

  echo ""
  log "申请 Let's Encrypt SSL 证书..."
  if ! command -v certbot &> /dev/null; then
    log "安装 Certbot..."
    apt update && apt install -y certbot python3-certbot-nginx
  fi

  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@qiweiban.com --redirect || {
    warn "Certbot 自动配置失败，尝试手动申请..."
    certbot certonly --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@qiweiban.com
    write_ssl_nginx
    nginx -t && systemctl reload nginx
  }

  echo ""
  log "=========================================="
  log "  Nginx + SSL 配置完成！"
  log "  https://$DOMAIN"
  log "=========================================="
  echo ""
  info "SSL 证书会自动续期（certbot 自带定时任务）"
  info "手动续期: certbot renew --dry-run"
}

write_ssl_nginx() {
  log "写入 HTTPS 配置..."
  cat > "$NGINX_CONF" << NGINXEOF
upstream ${APP_NAME}_upstream {
    server 127.0.0.1:${PORT};
    keepalive 64;
}

server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    location /_next/static/ {
        proxy_pass http://${APP_NAME}_upstream;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://${APP_NAME}_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGINXEOF
}

# ============================================================================
# 主入口
# ============================================================================
case "${1:-}" in
  setup)   setup ;;
  update)  update ;;
  restart) do_restart ;;
  stop)    do_stop ;;
  status)  do_status ;;
  logs)    do_logs ;;
  nginx)   setup_nginx ;;
  *)
    echo ""
    echo "  🦞 昆明龙虾局 - 部署管理脚本"
    echo ""
    echo "  用法: bash deploy.sh [命令]"
    echo ""
    echo "  命令:"
    echo "    setup     首次部署（安装依赖、构建、PM2 启动）"
    echo "    update    更新代码并重新构建部署"
    echo "    restart   重启应用"
    echo "    stop      停止应用"
    echo "    status    查看运行状态"
    echo "    logs      实时查看日志"
    echo "    nginx     自动配置 Nginx + SSL（$DOMAIN）"
    echo ""
    ;;
esac
