"""
数据管理系统 - 项目管理协作空间后端
支持：模块代码上传、用户管理、任务协作、数据文件管理
"""
import os
import json
import shutil
import hashlib
import datetime
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ============================================================
# 配置
# ============================================================
BASE_DIR = Path(__file__).resolve().parent.parent
MODULES_DIR = BASE_DIR / "modules"
UPLOADS_DIR = BASE_DIR / "uploads"
DATA_FILE = BASE_DIR / "server" / "data.json"

MODULES_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)

# 模块定义
MODULE_DEFS = {
    "dashboard":          {"name": "数据看板",         "icon": "DashboardOutlined"},
    "risk":               {"name": "风控数据",         "icon": "SafetyOutlined"},
    "underlying":         {"name": "底层参数",         "icon": "SettingOutlined"},
    "performance":        {"name": "绩效分析",         "icon": "BarChartOutlined"},
    "subjective_nav":     {"name": "主观净值分析",      "icon": "LineChartOutlined"},
    "subjective_holdings":{"name": "主观持仓分析",      "icon": "PieChartOutlined"},
    "subjective_pnl":     {"name": "主观盈亏分析",      "icon": "FundOutlined"},
    "correlation":        {"name": "相关性分析",       "icon": "DotChartOutlined"},
    "fof_report":         {"name": "FOF-申赎数据",     "icon": "FileTextOutlined"},
    "fof_holdings":       {"name": "FOF-持仓数据",     "icon": "TableOutlined"},
    "fof_nav":            {"name": "FOF-净值数据",     "icon": "NumberOutlined"},
    "fof_analysis":       {"name": "FOF-净值分析",     "icon": "AreaChartOutlined"},
    "bond_source":        {"name": "券源数据",         "icon": "DatabaseOutlined"},
    "user_management":    {"name": "用户管理",         "icon": "TeamOutlined"},
}

app = FastAPI(title="数据管理系统 - 项目协作空间", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 数据持久化
# ============================================================
def load_data() -> dict:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    default = {
        "users": [
            {"id": "u1", "username": "admin", "name": "系统管理员", "role": "管理员", "department": "技术部", "status": "active", "lastLogin": "2024-08-11 13:00"},
            {"id": "u2", "username": "zhang", "name": "张三", "role": "分析师", "department": "风控部", "status": "active", "lastLogin": "2024-08-11 12:30"},
            {"id": "u3", "username": "li", "name": "李四", "role": "分析师", "department": "研究部", "status": "active", "lastLogin": "2024-08-11 11:15"},
            {"id": "u4", "username": "wang", "name": "王五", "role": "操作员", "department": "交易部", "status": "active", "lastLogin": "2024-08-11 10:00"},
            {"id": "u5", "username": "zhao", "name": "赵六", "role": "操作员", "department": "运营部", "status": "inactive", "lastLogin": "2024-08-10 16:45"},
        ],
        "tasks": [],
        "module_assignments": {},
        "activities": [],
    }
    save_data(default)
    return default

def save_data(data: dict):
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

data_store = load_data()


# ============================================================
# 模型定义
# ============================================================
class UserCreate(BaseModel):
    username: str
    name: str
    role: str
    department: str

class TaskCreate(BaseModel):
    title: str
    module_id: str
    assignee_id: str
    description: str = ""

class ModuleAssign(BaseModel):
    module_id: str
    user_ids: List[str]

class ActivityLog(BaseModel):
    user: str
    action: str
    module: str
    detail: str = ""


# ============================================================
# 辅助函数
# ============================================================
def _get_module_info(module_id: str) -> dict:
    """获取模块文件信息"""
    module_dir = MODULES_DIR / module_id
    files = []
    if module_dir.exists():
        for f in module_dir.iterdir():
            if f.is_file():
                stat = f.stat()
                files.append({
                    "name": f.name,
                    "size": f.stat().st_size,
                    "type": f.suffix,
                    "modified": datetime.datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                })
    assignment = data_store.get("module_assignments", {}).get(module_id, [])
    return {
        "id": module_id,
        "name": MODULE_DEFS.get(module_id, {}).get("name", module_id),
        "icon": MODULE_DEFS.get(module_id, {}).get("icon", "FileOutlined"),
        "files": files,
        "assigned_users": assignment,
        "file_count": len(files),
    }

def _log_activity(user: str, action: str, module: str, detail: str = ""):
    entry = {
        "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user": user,
        "action": action,
        "module": MODULE_DEFS.get(module, {}).get("name", module),
        "detail": detail,
    }
    data_store["activities"].insert(0, entry)
    if len(data_store["activities"]) > 200:
        data_store["activities"] = data_store["activities"][:200]
    save_data(data_store)


# ============================================================
# API: 模块管理
# ============================================================
@app.get("/api/modules")
async def list_modules():
    """获取所有模块列表"""
    modules = []
    for mid, info in MODULE_DEFS.items():
        modules.append(_get_module_info(mid))
    return {"modules": modules}

@app.get("/api/modules/{module_id}")
async def get_module(module_id: str):
    """获取单个模块详情"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")
    return _get_module_info(module_id)

@app.get("/api/modules/{module_id}/files")
async def list_module_files(module_id: str):
    """列出模块下的所有文件"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")
    return {"files": _get_module_info(module_id)["files"]}

@app.post("/api/modules/{module_id}/upload")
async def upload_module_file(
    module_id: str,
    file: UploadFile = File(...),
    uploader: str = Form("unknown"),
):
    """上传代码文件到指定模块"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")

    # 安全检查：只允许代码、配置、文档类文件
    safe_ext = {".py", ".js", ".ts", ".jsx", ".tsx", ".json", ".yaml", ".yml",
                ".csv", ".txt", ".md", ".sql", ".sh", ".ipynb", ".toml", ".cfg", ".ini"}
    ext = Path(file.filename).suffix.lower()
    if ext not in safe_ext:
        raise HTTPException(400, f"不支持的文件类型: {ext}")

    module_dir = MODULES_DIR / module_id
    module_dir.mkdir(exist_ok=True)

    # 保存文件
    dest = module_dir / file.filename
    content = await file.read()
    dest.write_bytes(content)

    # 记录活动
    _log_activity(uploader, "上传文件", module_id, f"上传了 {file.filename} ({len(content)} bytes)")

    return {"success": True, "filename": file.filename, "size": len(content)}

@app.get("/api/modules/{module_id}/file/{filename}")
async def read_module_file(module_id: str, filename: str):
    """读取模块文件内容"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")
    filepath = MODULES_DIR / module_id / filename
    if not filepath.exists():
        raise HTTPException(404, "文件不存在")
    content = filepath.read_text(encoding="utf-8", errors="replace")
    return {"filename": filename, "content": content, "module_id": module_id}

@app.delete("/api/modules/{module_id}/file/{filename}")
async def delete_module_file(module_id: str, filename: str, user: str = "unknown"):
    """删除模块文件"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")
    filepath = MODULES_DIR / module_id / filename
    if not filepath.exists():
        raise HTTPException(404, "文件不存在")
    filepath.unlink()
    _log_activity(user, "删除文件", module_id, f"删除了 {filename}")
    return {"success": True}

@app.post("/api/modules/{module_id}/assign")
async def assign_module(module_id: str, assignment: ModuleAssign):
    """分配模块负责人"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")
    data_store["module_assignments"][module_id] = assignment.user_ids
    save_data(data_store)
    names = [u["name"] for u in data_store["users"] if u["id"] in assignment.user_ids]
    _log_activity("admin", "分配负责人", module_id, f"分配给 {', '.join(names)}")
    return {"success": True}


# ============================================================
# API: 用户管理
# ============================================================
@app.get("/api/users")
async def list_users():
    return {"users": data_store["users"]}

@app.post("/api/users")
async def create_user(user: UserCreate):
    uid = "u" + hashlib.md5(user.username.encode()).hexdigest()[:8]
    new_user = {
        "id": uid,
        "username": user.username,
        "name": user.name,
        "role": user.role,
        "department": user.department,
        "status": "active",
        "lastLogin": "-",
    }
    data_store["users"].append(new_user)
    save_data(data_store)
    _log_activity("admin", "创建用户", "user_management", f"创建用户 {user.name}")
    return new_user

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    data_store["users"] = [u for u in data_store["users"] if u["id"] != user_id]
    save_data(data_store)
    return {"success": True}

@app.put("/api/users/{user_id}/status")
async def toggle_user_status(user_id: str):
    for u in data_store["users"]:
        if u["id"] == user_id:
            u["status"] = "inactive" if u["status"] == "active" else "active"
            save_data(data_store)
            return u
    raise HTTPException(404, "用户不存在")


# ============================================================
# API: 任务管理
# ============================================================
@app.get("/api/tasks")
async def list_tasks():
    return {"tasks": data_store["tasks"]}

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    tid = "t" + hashlib.md5((task.title + datetime.datetime.now().isoformat()).encode()).hexdigest()[:8]
    new_task = {
        "id": tid,
        "title": task.title,
        "module_id": task.module_id,
        "module_name": MODULE_DEFS.get(task.module_id, {}).get("name", task.module_id),
        "assignee_id": task.assignee_id,
        "assignee_name": next((u["name"] for u in data_store["users"] if u["id"] == task.assignee_id), "未知"),
        "description": task.description,
        "status": "pending",
        "progress": 0,
        "createdAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "updatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    data_store["tasks"].append(new_task)
    save_data(data_store)
    _log_activity("admin", "创建任务", task.module_id, f"创建任务: {task.title}")
    return new_task

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, status: str = None, progress: int = None):
    for t in data_store["tasks"]:
        if t["id"] == task_id:
            if status:
                t["status"] = status
            if progress is not None:
                t["progress"] = progress
            t["updatedAt"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            save_data(data_store)
            return t
    raise HTTPException(404, "任务不存在")

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    data_store["tasks"] = [t for t in data_store["tasks"] if t["id"] != task_id]
    save_data(data_store)
    return {"success": True}


# ============================================================
# API: 数据文件上传（CSV/Excel等原始数据）
# ============================================================
@app.post("/api/data/upload")
async def upload_data_file(
    file: UploadFile = File(...),
    module_id: str = Form(...),
    uploader: str = Form("unknown"),
):
    """上传原始数据文件"""
    if module_id not in MODULE_DEFS:
        raise HTTPException(404, "模块不存在")

    safe_ext = {".csv", ".xlsx", ".xls", ".json", ".txt", ".parquet"}
    ext = Path(file.filename).suffix.lower()
    if ext not in safe_ext:
        raise HTTPException(400, f"不支持的文件类型: {ext}")

    upload_dir = UPLOADS_DIR / module_id
    upload_dir.mkdir(exist_ok=True)

    dest = upload_dir / file.filename
    content = await file.read()
    dest.write_bytes(content)

    _log_activity(uploader, "上传数据", module_id, f"上传数据文件 {file.filename}")
    return {"success": True, "filename": file.filename, "size": len(content)}

@app.get("/api/data/files")
async def list_data_files(module_id: str = None):
    """列出上传的数据文件"""
    result = {}
    dirs = [UPLOADS_DIR / module_id] if module_id else UPLOADS_DIR.iterdir()
    for d in (dirs if module_id else [p for p in UPLOADS_DIR.iterdir() if p.is_dir()]):
        if not d.exists():
            continue
        mid = module_id or d.name
        files = []
        for f in d.iterdir():
            if f.is_file():
                stat = f.stat()
                files.append({
                    "name": f.name,
                    "size": stat.st_size,
                    "type": f.suffix,
                    "modified": datetime.datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                })
        result[mid] = {"module_name": MODULE_DEFS.get(mid, {}).get("name", mid), "files": files}
    return {"data_files": result}


# ============================================================
# API: 活动日志
# ============================================================
@app.get("/api/activities")
async def list_activities(limit: int = 50):
    return {"activities": data_store["activities"][:limit]}


# ============================================================
# API: 项目统计
# ============================================================
@app.get("/api/stats")
async def project_stats():
    total_files = sum(len(list((MODULES_DIR / mid).iterdir())) for mid in MODULE_DEFS if (MODULES_DIR / mid).exists())
    return {
        "total_modules": len(MODULE_DEFS),
        "total_files": total_files,
        "total_users": len(data_store["users"]),
        "active_users": len([u for u in data_store["users"] if u["status"] == "active"]),
        "total_tasks": len(data_store["tasks"]),
        "pending_tasks": len([t for t in data_store["tasks"] if t["status"] == "pending"]),
        "completed_tasks": len([t for t in data_store["tasks"] if t["status"] == "completed"]),
    }


# ============================================================
# 静态文件服务（前端 React 构建产物）
# ============================================================
static_dir = BASE_DIR / "server" / "static"
if static_dir.exists():
    @app.get("/")
    async def serve_frontend():
        return FileResponse(static_dir / "index.html")

    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
else:
    # 回退到原始前端目录
    frontend_dir = BASE_DIR / "frontend"
    if frontend_dir.exists():
        @app.get("/")
        async def serve_frontend_fallback():
            return FileResponse(frontend_dir / "index.html")

        app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")


# ============================================================
# 启动
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
