"""
数据看板模块 - 数据聚合处理
功能：汇总各模块数据，生成看板统计指标
作者：张三
"""
import json
from datetime import datetime


def aggregate_dashboard_data(raw_data: list) -> dict:
    """聚合原始数据生成看板指标"""
    total_scale = sum(item.get('scale', 0) for item in raw_data)
    product_count = len(set(item.get('product', '') for item in raw_data))
    
    return {
        'total_scale': round(total_scale, 2),
        'product_count': product_count,
        'holding_count': len(raw_data),
        'update_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': '正常' if total_scale > 0 else '异常',
    }


def generate_pie_data(raw_data: list) -> list:
    """生成饼图数据（持仓产品占比）"""
    product_scale = {}
    for item in raw_data:
        name = item.get('product', '未知')
        product_scale[name] = product_scale.get(name, 0) + item.get('scale', 0)
    
    return [{'type': k, 'value': round(v, 2)} for k, v in product_scale.items()]


if __name__ == '__main__':
    # 测试数据
    test_data = [
        {'product': '产品A', 'scale': 100},
        {'product': '产品B', 'scale': 200},
        {'product': '产品A', 'scale': 50},
    ]
    print(json.dumps(aggregate_dashboard_data(test_data), ensure_ascii=False, indent=2))
