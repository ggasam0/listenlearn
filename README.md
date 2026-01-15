# ListenLearn 听力学习项目

一个用于精听训练的全栈示例项目：前端使用 React，后端使用 FastAPI。支持课程列表、音频播放、听写问题与即时评分。

## 功能概览

- 课程列表与详细信息
- 听力音频播放与原文显示
- 听力问题填写与评分反馈
- 学习进度提示

## 本地开发

### 后端（FastAPI）

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端（React）

```bash
cd frontend
npm install
npm run dev
```

前端默认请求 `http://localhost:8000`。如需更改，请在 `frontend` 目录下创建 `.env`：

```bash
VITE_API_BASE=http://localhost:8000
```

## 部署

部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。
