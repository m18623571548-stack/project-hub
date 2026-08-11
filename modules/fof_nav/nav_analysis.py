"""
FOF净值分析模块
功能：对FOF产品的净值数据进行深度分析
作者：钱七
"""
import numpy as np
from typing import List, Dict
from datetime import datetime


def analyze_nav_series(nav_data: List[Dict]) -> Dict:
    """分析净值序列"""
    navs = [d['nav'] for d in nav_data]
    dates = [d['date'] for d in nav_data]
    
    total_return = (navs[-1] - navs[0]) / navs[0]
    days = (datetime.strptime(dates[-1], '%Y-%m-%d') - datetime.strptime(dates[0], '%Y-%m-%d')).days
    
    daily_returns = np.diff(navs) / navs[:-1]
    
    return {
        'start_date': dates[0],
        'end_date': dates[-1],
        'total_return': round(total_return * 100, 2),
        'annual_return': round(((1 + total_return) ** (365 / days) - 1) * 100, 2),
        'volatility': round(float(np.std(daily_returns) * np.sqrt(252) * 100), 2),
        'max_drawdown': round(float(np.min((np.array(navs) - np.maximum.accumulate(navs)) / np.maximum.accumulate(navs)) * 100), 2),
    }


if __name__ == '__main__':
    test_navs = [
        {'date': '2024-01-01', 'nav': 1.0000},
        {'date': '2024-02-01', 'nav': 1.0250},
        {'date': '2024-03-01', 'nav': 1.0180},
        {'date': '2024-04-01', 'nav': 1.0520},
    ]
    result = analyze_nav_series(test_navs)
    for k, v in result.items():
        print(f"{k}: {v}")
