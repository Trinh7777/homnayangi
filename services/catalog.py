"""Chuẩn bị dữ liệu món ăn / tỉ lệ để gửi ra giao diện."""
from __future__ import annotations

from flask import url_for

from data.items import ITEMS, POOLS, RARITIES
from services.gacha import pool_probabilities
from services.spin_limit import format_cooldown_label
from utils.format import format_price, format_percent


def serialize_item(item_id: str) -> dict:
    item = ITEMS[item_id]
    return {
        "id": item_id,
        "name": item["name"],
        "price": item["price"],
        "price_text": format_price(item["price"]),
        "rarity": item["rarity"],
        "emoji": item.get("emoji", "🍽️"),
        "image": url_for("static", filename=item["image"]) if item.get("image") else None,
        "desc": item.get("desc", ""),
        "action": item.get("action"),
    }


def build_game_data(
    pending_boxes: int = 0,
    remaining_seconds: int = 0,
    cooldown_seconds: int = 60,
    spin_limit_enabled: bool = True,
) -> dict:
    """Toàn bộ dữ liệu frontend cần (nhúng vào trang dưới dạng JSON)."""
    return {
        "rarities": RARITIES,
        "items": {item_id: serialize_item(item_id) for item_id in ITEMS},
        "pools": {
            pool_id: {
                "name": pool["name"],
                "subtitle": pool.get("subtitle", ""),
                "items": pool["items"],
                "probabilities": pool_probabilities(pool_id),
            }
            for pool_id, pool in POOLS.items()
        },
        "pending_boxes": pending_boxes,
        "cooldown": {
            "enabled": spin_limit_enabled,
            "remaining_seconds": remaining_seconds,
            "cooldown_seconds": cooldown_seconds,
            "label": format_cooldown_label(cooldown_seconds),
        },
    }


def build_rates_table() -> list[dict]:
    """Bảng tỉ lệ rơi cho modal 'Tỉ lệ', sắp xếp từ hiếm đến phổ thông."""
    tables = []
    for pool_id, pool in POOLS.items():
        probs = pool_probabilities(pool_id)
        rows = []
        for item_id in sorted(pool["items"], key=lambda i: -RARITIES[ITEMS[i]["rarity"]]["tier"]):
            item = serialize_item(item_id)
            rows.append({
                "item": item,
                "rarity": RARITIES[item["rarity"]],
                "percent": format_percent(probs[item_id]),
            })
        tables.append({"id": pool_id, "name": pool["name"], "rows": rows})
    return tables
