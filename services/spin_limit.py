"""Quản lý giới hạn lượt quay (ví dụ: hồi lượt sau 1 phút, 5 phút, 1 giờ...)."""
from __future__ import annotations

import json
import time
from datetime import datetime
from pathlib import Path


def get_remaining_seconds(save_file: Path, cooldown_seconds: int = 60) -> int:
    """Trả về số giây còn phải chờ trước lượt quay tiếp theo. 0 nếu đã sẵn sàng."""
    if not save_file.exists():
        return 0
    try:
        data = json.loads(save_file.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return 0

    last_spin = data.get("last_spin_timestamp")
    if last_spin is None:
        return 0

    now = time.time()
    elapsed = now - float(last_spin)
    remaining = cooldown_seconds - elapsed
    return max(0, int(remaining))


def can_spin(save_file: Path, cooldown_seconds: int = 60) -> bool:
    """Kiểm tra có được phép quay hay không."""
    return get_remaining_seconds(save_file, cooldown_seconds) <= 0


def save_spin(save_file: Path) -> None:
    """Lưu lại thời điểm vừa quay."""
    now_ts = time.time()
    data = {
        "last_spin_timestamp": now_ts,
        "last_spin_iso": datetime.fromtimestamp(now_ts).strftime("%Y-%m-%d %H:%M:%S"),
    }
    save_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def format_cooldown_label(seconds: int) -> str:
    """Đổi số giây thành nhãn dễ hiểu, ví dụ: 60 -> '1 phút', 3600 -> '1 giờ'."""
    if seconds >= 3600:
        h = seconds / 3600
        return f"{int(h) if h.is_integer() else h} giờ"
    if seconds >= 60:
        m = seconds / 60
        return f"{int(m) if m.is_integer() else m} phút"
    return f"{seconds} giây"


def format_remaining_time(seconds: int) -> str:
    """Định dạng thời gian chờ thành chuỗi hiển thị thân thiện."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours} giờ {minutes:02d} phút"
    if minutes > 0:
        return f"{minutes} phút {secs:02d} giây"
    return f"{secs} giây"
