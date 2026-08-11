"""
风控数据模块 - 风险监控与预警
功能：实时监控各项风险指标，触发预警
作者：李四
"""
from dataclasses import dataclass
from typing import List


@dataclass
class RiskIndicator:
    name: str
    current_value: float
    threshold: float
    risk_type: str


def check_risk(indicators: List[RiskIndicator]) -> List[dict]:
    """检查各项风险指标是否超标"""
    alerts = []
    for ind in indicators:
        if ind.current_value > ind.threshold:
            alerts.append({
                'indicator': ind.name,
                'current': ind.current_value,
                'threshold': ind.threshold,
                'level': 'danger' if ind.current_value > ind.threshold * 1.2 else 'warning',
                'type': ind.risk_type,
            })
    return alerts


if __name__ == '__main__':
    indicators = [
        RiskIndicator('回撤', 12.5, 10, '回撤风险'),
        RiskIndicator('波动率', 8.3, 15, '波动风险'),
    ]
    for alert in check_risk(indicators):
        print(f"[{alert['level']}] {alert['indicator']}: {alert['current']} > {alert['threshold']}")
