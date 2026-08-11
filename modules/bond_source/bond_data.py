"""
券源数据模块
功能：管理债券/券源数据，监控使用率
作者：张三
"""
from dataclasses import dataclass
from typing import List


@dataclass
class BondSource:
    name: str
    bond_type: str
    total_scale: float
    used_scale: float
    maturity_date: str
    
    @property
    def usage_rate(self) -> float:
        return self.used_scale / self.total_scale * 100 if self.total_scale > 0 else 0
    
    @property
    def status(self) -> str:
        if self.usage_rate > 90:
            return '紧张'
        return '可用'


def filter_available_sources(sources: List[BondSource], min_available: float = 0.1) -> List[BondSource]:
    """筛选可用券源（剩余比例 > min_available）"""
    return [s for s in sources if (1 - s.used_scale / s.total_scale) >= min_available]


if __name__ == '__main__':
    sources = [
        BondSource('国债230001', '国债', 5000, 3250, '2026-03-15'),
        BondSource('国开债230205', '政金债', 8000, 6560, '2028-06-20'),
    ]
    for s in sources:
        print(f"{s.name}: 使用率 {s.usage_rate:.1f}%, 状态: {s.status}")
