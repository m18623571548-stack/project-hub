"""
绩效分析模块 - 计算产品绩效指标
功能：计算夏普比率、最大回撤、年化收益等
作者：赵六
"""
import numpy as np
from typing import List


def calc_sharpe_ratio(returns: List[float], risk_free: float = 0.03) -> float:
    """计算夏普比率"""
    arr = np.array(returns)
    excess = arr - risk_free / 252
    if np.std(excess) == 0:
        return 0
    return float(np.mean(excess) / np.std(excess) * np.sqrt(252))


def calc_max_drawdown(navs: List[float]) -> float:
    """计算最大回撤"""
    arr = np.array(navs)
    peak = np.maximum.accumulate(arr)
    drawdown = (arr - peak) / peak
    return float(np.min(drawdown))


def calc_annual_return(start_nav: float, end_nav: float, days: int) -> float:
    """计算年化收益率"""
    total_return = (end_nav - start_nav) / start_nav
    return (1 + total_return) ** (365 / days) - 1


if __name__ == '__main__':
    returns = [0.01, -0.005, 0.02, 0.015, -0.01, 0.03, 0.005]
    navs = [1.0, 1.01, 1.005, 1.025, 1.04, 1.03, 1.06, 1.065]
    print(f"夏普比率: {calc_sharpe_ratio(returns):.4f}")
    print(f"最大回撤: {calc_max_drawdown(navs):.4%}")
