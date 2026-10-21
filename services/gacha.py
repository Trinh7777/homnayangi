"""Logic quay gacha: tính tỉ lệ, chọn món trúng, dựng dải quay."""
from __future__ import annotations

import random

from data.items import ITEMS, POOLS, RARITIES

# Dùng nguồn ngẫu nhiên của hệ điều hành cho "công bằng"
_rng = random.SystemRandom()


def pool_probabilities(pool_id: str) -> dict[str, float]:
    """Trả về {item_id: xác suất (0..1)} của một vòng quay."""
    pool = POOLS[pool_id]
    items = pool["items"]
    rarity_weights = pool.get("rarity_weights")

    if not rarity_weights:
        p = 1 / len(items)
        return {item_id: p for item_id in items}

    # Gom món theo phẩm chất
    groups: dict[str, list[str]] = {}
    for item_id in items:
        groups.setdefault(ITEMS[item_id]["rarity"], []).append(item_id)

    total = sum(rarity_weights.get(r, 0) for r in groups)
    probs = {}
    for rarity, ids in groups.items():
        share = rarity_weights.get(rarity, 0) / total
        for item_id in ids:
            probs[item_id] = share / len(ids)
    return probs


def roll(pool_id: str) -> str:
    """Quay 1 lần, trả về id món trúng."""
    probs = pool_probabilities(pool_id)
    ids = list(probs)
    return _rng.choices(ids, weights=[probs[i] for i in ids], k=1)[0]


def _tier(item_id: str) -> int:
    return RARITIES[ITEMS[item_id]["rarity"]]["tier"]


def build_reel(pool_id: str, winner: str, length: int, win_index: int,
               near_miss_chance: float = 0.0) -> list[str]:
    """Dựng dải quay ngang: các ô ngẫu nhiên theo tỉ lệ, ô win_index là món trúng."""
    probs = pool_probabilities(pool_id)
    ids = list(probs)
    reel = _rng.choices(ids, weights=[probs[i] for i in ids], k=length)
    reel[win_index] = winner

    # "Suýt trúng": đặt món hiếm nhất ngay cạnh ô trúng
    best = max(ids, key=_tier)
    if winner != best and _rng.random() < near_miss_chance:
        reel[win_index + _rng.choice((-1, 1))] = best
    return reel


def spin(pool_id: str, length: int, win_index: int, near_miss_chance: float = 0.0) -> dict:
    winner = roll(pool_id)
    return {
        "pool": pool_id,
        "winner": winner,
        "reel": build_reel(pool_id, winner, length, win_index, near_miss_chance),
        "win_index": win_index,
    }
