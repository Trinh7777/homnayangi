"""
DỮ LIỆU MÓN ĂN, PHẨM CHẤT VÀ VÒNG QUAY
=====================================
Muốn thêm món mới:
  1. Thêm 1 mục vào ITEMS (ảnh bỏ vào static/img/, thiếu ảnh sẽ tự hiện emoji).
  2. Thêm id món vào "items" của pool tương ứng trong POOLS.
"""

# ---------------------------------------------------------------------------
# PHẨM CHẤT (tier càng cao càng hiếm, hiệu ứng nổ càng hoành tráng)
# ---------------------------------------------------------------------------
RARITIES = {
    "green":   {"name": "Phổ Thông",   "color": "#3ddc6a", "tier": 1, "stars": 1},
    "blue":    {"name": "Hiếm",        "color": "#3b9bff", "tier": 2, "stars": 2},
    "purple":  {"name": "Sử Thi",      "color": "#b45cff", "tier": 3, "stars": 3},
    "red":     {"name": "Huyền Thoại", "color": "#ff3b4d", "tier": 4, "stars": 4},
    "gold":    {"name": "Thần Thoại",  "color": "#ffc531", "tier": 5, "stars": 5},
    "mystery": {"name": "Bí Ẩn",       "color": "#ff7a1a", "tier": 3, "stars": 0},
}

# ---------------------------------------------------------------------------
# MÓN ĂN / VẬT PHẨM
#   image : đường dẫn trong thư mục static/ (None hoặc file không tồn tại -> dùng emoji)
#   action: hành động đặc biệt khi quay trúng
# ---------------------------------------------------------------------------
ITEMS = {
    "banh_mi": {
        "name": "Bánh Mì", "price": 20_000, "rarity": "green",
        "image": "img/banh_mi.jpg", "emoji": "🥖",
        "desc": "Nhanh gọn, rẻ, no lâu. Huyền thoại đường phố!",
    },
    "bun_cha": {
        "name": "Bún Chả", "price": 35_000, "rarity": "blue",
        "image": "img/bun_cha.jpg", "emoji": "🥢",
        "desc": "Chả nướng thơm lừng, nước chấm chua ngọt chuẩn vị Hà Nội.",
    },
    "pho": {
        "name": "Phở", "price": 40_000, "rarity": "purple",
        "image": "img/pho.jpg", "emoji": "🍜",
        "desc": "Nước dùng trong veo, bánh phở mềm, quốc hồn quốc tuý.",
    },
    "com_tam": {
        "name": "Cơm Tấm", "price": 45_000, "rarity": "red",
        "image": "img/com_tam.jpg", "emoji": "🍛",
        "desc": "Sườn nướng, bì, chả, trứng ốp la. Đầy đủ topping!",
    },
    "lau": {
        "name": "Lẩu", "price": 100_000, "rarity": "gold",
        "image": "img/lau.jpg", "emoji": "🍲",
        "desc": "JACKPOT! Hôm nay ăn lẩu, rủ cả hội đi luôn!",
    },
    "mystery_box": {
        "name": "Hộp Quà Bí Ẩn", "price": None, "rarity": "mystery",
        "image": "img/hop_qua.jpg", "emoji": "🎁",
        "desc": "Mở ra để có cơ hội nhận LẨU Thần Thoại!",
        "action": "open_mystery",
    },
}

# ---------------------------------------------------------------------------
# VÒNG QUAY
#   rarity_weights = None  -> tỉ lệ đều cho mọi món
#   rarity_weights = {...} -> tỉ lệ chia theo phẩm chất (tổng không cần = 100,
#                             nếu 1 phẩm chất có nhiều món thì chia đều trong phẩm chất đó)
# ---------------------------------------------------------------------------
POOLS = {
    "normal": {
        "name": "Vòng Quay Ẩm Thực",
        "subtitle": "Không biết ăn gì? Để số phận quyết định!",
        "items": ["banh_mi", "bun_cha", "pho", "com_tam", "mystery_box"],
        "rarity_weights": None,
    },
    "mystery": {
        "name": "Hộp Quà Bí Ẩn",
        "subtitle": "Tỉ lệ theo phẩm chất – có cơ hội nhận LẨU Thần Thoại!",
        "items": ["banh_mi", "bun_cha", "pho", "com_tam", "lau"],
        "rarity_weights": {
            "green": 40,
            "blue": 28,
            "purple": 18,
            "red": 10,
            "gold": 4,
        },
    },
}
