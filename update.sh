#!/bin/bash
# 数据管理系统 - 一键更新脚本 (Linux/macOS)
# 用法:
#   ./update.sh           更新代码并重启服务
#   ./update.sh --no-restart  只更新代码，不重启服务

NO_RESTART=false
if [ "$1" = "--no-restart" ]; then
    NO_RESTART=true
fi

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT" || exit 1

echo "=========================================="
echo "  数据管理系统 - 一键更新"
echo "=========================================="

# 1. 检查远程仓库
echo "[1/4] 检查 Git 远程仓库..."
git remote get-url origin >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "错误: 未配置远程仓库 origin"
    exit 1
fi

# 2. 保存本地未提交改动（防止 pull 冲突）
echo "[2/4] 检查本地未提交改动..."
HAS_LOCAL_CHANGES=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    HAS_LOCAL_CHANGES=true
    echo "发现本地改动，先暂存..."
    git stash push -u -m "auto-stash before update"
    if [ $? -ne 0 ]; then
        echo "没有可暂存的改动，继续..."
        HAS_LOCAL_CHANGES=false
    fi
fi

# 3. git pull
echo "[3/4] 从 GitHub 拉取最新代码..."
git pull origin master
if [ $? -ne 0 ]; then
    echo "错误: git pull 失败"
    exit 1
fi

# 4. 恢复本地改动
if [ "$HAS_LOCAL_CHANGES" = true ]; then
    echo "恢复本地暂存的改动..."
    git stash pop
    if [ $? -ne 0 ]; then
        echo "警告: 恢复本地改动时发生冲突，请手动处理: git stash pop"
    fi
fi

# 5. 重启服务
if [ "$NO_RESTART" = true ]; then
    echo "已完成代码更新（未重启服务）。"
    exit 0
fi

echo "[4/4] 重启服务..."

# 停止旧服务
pkill -f "python main.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null
sleep 2

# 启动新服务（后台）
cd "$PROJECT_ROOT/server"
nohup python main.py > "$PROJECT_ROOT/uvicorn.log" 2> "$PROJECT_ROOT/uvicorn_err.log" &
sleep 4

# 验证服务
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/ 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "服务启动成功: http://localhost:5000"
else
    echo "警告: 服务可能未正常启动，请查看 $PROJECT_ROOT/uvicorn_err.log"
fi
