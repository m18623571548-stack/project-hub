#!/bin/bash
# 数据管理系统 - 项目协作空间启动脚本

echo "=========================================="
echo "  数据管理系统 - 项目协作空间"
echo "=========================================="

# 检查后端依赖
cd "$(dirname "$0")/server"

echo "[1/2] 检查 Python 依赖..."
pip install -q -r requirements.txt

# 启动后端
echo "[2/2] 启动服务..."
echo ""
echo "服务启动中..."
echo "访问地址: http://localhost:5000"
echo ""

python main.py
