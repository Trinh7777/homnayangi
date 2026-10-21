"""Cấu hình chung của ứng dụng. Sửa thông số game ở đây."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "hom-nay-an-gi-doi-key-khi-deploy")

    # ---- Vòng quay ----
    REEL_LENGTH = 60          # Tổng số ô trên dải quay
    REEL_WIN_INDEX = 52       # Vị trí ô trúng thưởng (càng xa quay càng lâu)
    NEAR_MISS_CHANCE = 0.35   # Xác suất đặt món hiếm nhất sát cạnh ô trúng (tạo cảm giác "suýt trúng")

    # ---- Giới hạn lượt quay ----
    SPIN_LIMIT_ENABLED = True          # Bật giới hạn quay
    SPIN_COOLDOWN_SECONDS = 60         # Hồi lượt sau 1 phút (60 giây)
    SPIN_DATA_FILE = BASE_DIR / "spin_data.json"
