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
    "gray":    {"name": "Tiết Kiệm",   "color": "#94a3b8", "tier": 1, "stars": 1},
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
    "nhin": {
        "name": "Nhịn Ăn", "price": 0, "rarity": "gray",
        "image": "img/nhin.jpg", "emoji": "🫗",
        "desc": "Thắt lưng buộc bụng! Uống cốc nước lọc rồi ngủ một giấc cho khoẻ.",
    },
    "tu_nau_com": {
        "name": "Tự Nấu Cơm", "price": 0, "rarity": "gray",
        "image": "img/tu_nau_com.jpg", "emoji": "🍳",
        "desc": "Mở tủ lạnh xem có gì nấu nấy, vừa ngon vừa sạch sẽ ấm cúng.",
    },
    "banh_mi": {
        "name": "Bánh Mì", "price": 20_000, "rarity": "green",
        "image": "img/banh_mi.jpg", "emoji": "🥖",
        "desc": "Nhanh gọn, rẻ, no lâu. Huyền thoại đường phố!",
    },
    "banh_bao": {
        "name": "Bánh Bao", "price": 25_000, "rarity": "green",
        "image": "img/banh_bao.jpg", "emoji": "🥟",
        "desc": "Nóng hổi vừa thổi vừa ăn, vỏ mềm xốp nhân thịt trứng cút thơm lừng.",
    },
    "chao_long": {
        "name": "Cháo Lòng", "price": 30_000, "rarity": "blue",
        "image": "img/chao_long.jpg", "emoji": "🥣",
        "desc": "Cháo sánh mịn, lòng dồi giòn sần sật, thêm chút tiêu ớt ấm bụng.",
    },
    "bun_cha": {
        "name": "Bún Chả", "price": 35_000, "rarity": "blue",
        "image": "img/bun_cha.jpg", "emoji": "🥢",
        "desc": "Chả nướng thơm lừng, nước chấm chua ngọt chuẩn vị Hà Nội.",
    },
    "pho_cuon": {
        "name": "Phở Cuốn", "price": 35_000, "rarity": "purple",
        "image": "img/pho_cuon.webp", "emoji": "🌯",
        "desc": "Bánh phở mềm cuộn thịt bò xào rau thơm, chấm nước mắm tỏi ớt chua ngọt.",
    },
    "bun_bo": {
        "name": "Bún Bò", "price": 40_000, "rarity": "purple",
        "image": "img/bun_bo.jpg", "emoji": "🍜",
        "desc": "Nước dùng cay nồng thơm mùi sả ruốc, thịt bò đầy đặn chuẩn vị Huế.",
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
        "items": [
            "nhin",
            "tu_nau_com",
            "banh_mi",
            "banh_bao",
            "chao_long",
            "bun_cha",
            "pho_cuon",
            "bun_bo",
            "com_tam",
            "mystery_box",
        ],
        "rarity_weights": None,
    },
    "mystery": {
        "name": "Hộp Quà Bí Ẩn",
        "subtitle": "Tỉ lệ theo phẩm chất – có cơ hội nhận LẨU Thần Thoại!",
        "items": [
            "nhin",
            "tu_nau_com",
            "banh_mi",
            "banh_bao",
            "chao_long",
            "bun_cha",
            "pho_cuon",
            "bun_bo",
            "com_tam",
            "lau",
        ],
        "rarity_weights": {
            "gray": 10,
            "green": 30,
            "blue": 26,
            "purple": 18,
            "red": 12,
            "gold": 4,
        },
    },
}
