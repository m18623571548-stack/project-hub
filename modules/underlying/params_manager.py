"""
底层参数管理模块
功能：管理系统底层配置参数（收益率、费率、风险敞口等）
作者：王五
"""
import json
from pathlib import Path


class ParamsManager:
    def __init__(self, config_path: str = "params.json"):
        self.config_path = Path(config_path)
        self.params = self._load()
    
    def _load(self) -> dict:
        if self.config_path.exists():
            return json.loads(self.config_path.read_text(encoding='utf-8'))
        return {'benchmark_rate': 0.035, 'max_exposure': 0.3, 'stop_loss': 0.85}
    
    def save(self):
        self.config_path.write_text(json.dumps(self.params, ensure_ascii=False, indent=2), encoding='utf-8')
    
    def update(self, key: str, value):
        self.params[key] = value
        self.save()


if __name__ == '__main__':
    mgr = ParamsManager()
    print(f"当前基准收益率: {mgr.params.get('benchmark_rate', 'N/A')}")
