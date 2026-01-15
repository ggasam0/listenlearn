# 部署指南

本项目分为 FastAPI 后端与 React 前端两部分，可以独立部署。下面提供一个基础的部署流程，适合用于云服务器或容器环境。

## 1. 后端部署（FastAPI）

1. 准备 Python 环境（建议 3.11+）。
2. 安装依赖并启动服务：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. 生产环境建议使用进程管理工具，例如 `systemd` 或 `supervisor`，并设置反向代理（Nginx）。

## 2. 前端部署（React）

1. 安装依赖并构建：

```bash
cd frontend
npm install
npm run build
```

2. 将 `frontend/dist` 输出目录部署到静态资源服务器，例如 Nginx。
3. 设置环境变量（构建时）：

```bash
VITE_API_BASE=https://your-api-domain.com
npm run build
```

## 3. Nginx 参考配置

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    root /var/www/listenlearn/dist;
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 4. 跨域注意事项

如果前端与后端域名不同，需要在后端 `CORSMiddleware` 中添加允许的来源。当前默认允许 `http://localhost:5173`。
