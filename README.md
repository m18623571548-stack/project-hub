# 数据管理系统 - 项目协作空间

## 项目概述

这是一个支持多人协同的数据管理系统开发平台。不同的团队成员可以负责不同的模块，上传各自的代码和原始数据，最终整合成完整的数据管理系统。

## 系统架构

```
project-hub/
├── server/                    # FastAPI 后端服务
│   ├── main.py               # API 接口（模块管理、用户、任务、文件上传）
│   ├── requirements.txt      # Python 依赖
│   ├── data.json             # 用户/任务数据持久化
│   └── static/               # React 前端构建产物（自动部署）
├── web/                       # React + TypeScript 前端
│   ├── src/                  # 源代码
│   │   ├── components/       # 公共组件
│   │   ├── pages/            # 页面组件
│   │   ├── utils/            # API 工具
│   │   └── App.tsx           # 路由配置
│   ├── package.json          # 前端依赖
│   └── vite.config.ts        # Vite 构建配置
├── frontend/                  # 旧版单文件前端（备用）
├── modules/                   # 各模块代码目录（14 个模块）
│   ├── dashboard/            # 数据看板
│   ├── risk/                 # 风控数据
│   ├── underlying/           # 底层参数
│   ├── performance/          # 绩效分析
│   ├── subjective_nav/       # 主观净值分析
│   ├── subjective_holdings/  # 主观持仓分析
│   ├── subjective_pnl/       # 主观盈亏分析
│   ├── correlation/          # 相关性分析
│   ├── fof_report/           # FOF-申赎数据
│   ├── fof_holdings/         # FOF-持仓数据
│   ├── fof_nav/              # FOF-净值数据
│   ├── fof_analysis/         # FOF-净值分析
│   ├── bond_source/          # 券源数据
│   └── user_management/      # 用户管理
└── uploads/                   # 原始数据文件上传目录
```

## 快速启动

### 方式一：一键启动（推荐）

```bash
cd /workspace/project-hub
./start.sh
```

服务运行在 `http://localhost:5000`

### 方式二：手动启动

```bash
# 1. 安装后端依赖
cd server
pip install -r requirements.txt

# 2. 启动服务
python main.py
```

### 方式三：开发模式（前端热更新）

```bash
# 终端 1: 启动后端
cd server
python main.py

# 终端 2: 启动前端开发服务器
cd web
npm install
npm run dev
```

前端开发服务器运行在 `http://localhost:3000`，会自动代理 API 请求到后端。

---

## 功能说明

### 项目概览
- 查看整体项目统计数据（模块数、文件数、成员数、任务数）
- 展示所有模块的开发状态
- 最近操作活动日志

### 模块管理
- **14 个功能模块**，每个模块独立管理
- 点击模块查看已上传的代码文件
- **上传代码文件**：支持 .py .js .ts .json .csv .txt 等格式
- **查看代码**：在线预览模块代码
- **分配负责人**：将模块分配给不同的团队成员

### 任务协作
- 创建任务，关联到具体模块和负责人
- 任务状态流转：待处理 → 处理中 → 已完成
- 支持任务进度追踪

### 数据文件
- 上传原始数据文件（CSV/Excel/JSON）
- 按模块分类管理数据文件
- 拖拽上传支持

### 成员管理
- 添加/移除项目成员
- 设置角色（管理员/分析师/操作员）和部门
- 查看成员在线状态

### 活动日志
- 记录所有操作活动
- 谁在什么时间对哪个模块做了什么

### 看板预览
- 内嵌预览 data-management-system 的数据看板

## 多人协同工作流程

```
1. 管理员创建项目 → 添加团队成员
                    ↓
2. 管理员分配模块负责人（可多人负责同一模块）
                    ↓
3. 团队成员上传各模块代码
   ├── 张三上传 dashboard 模块代码
   ├── 李四上传 risk 模块代码
   └── 王五上传 underlying 模块代码
                    ↓
4. 团队成员上传原始数据文件
                    ↓
5. 管理员创建数据处理任务
   ├── 任务A: 张三处理持仓数据
   ├── 任务B: 李四计算风控指标
   └── 任务C: 王五更新底层参数
                    ↓
6. 各成员完成后更新任务状态
                    ↓
7. 数据看板展示最终结果
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/modules` | 获取所有模块 |
| GET | `/api/modules/{id}` | 获取模块详情 |
| GET | `/api/modules/{id}/files` | 列出模块文件 |
| POST | `/api/modules/{id}/upload` | 上传代码文件 |
| GET | `/api/modules/{id}/file/{name}` | 读取文件内容 |
| DELETE | `/api/modules/{id}/file/{name}` | 删除文件 |
| POST | `/api/modules/{id}/assign` | 分配负责人 |
| GET | `/api/users` | 用户列表 |
| POST | `/api/users` | 添加用户 |
| DELETE | `/api/users/{id}` | 删除用户 |
| GET | `/api/tasks` | 任务列表 |
| POST | `/api/tasks` | 创建任务 |
| PUT | `/api/tasks/{id}` | 更新任务状态 |
| DELETE | `/api/tasks/{id}` | 删除任务 |
| POST | `/api/data/upload` | 上传数据文件 |
| GET | `/api/data/files` | 数据文件列表 |
| GET | `/api/activities` | 活动日志 |
| GET | `/api/stats` | 项目统计 |
