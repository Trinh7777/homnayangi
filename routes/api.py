"""API quay gacha. Kết quả được quyết định ở server (Python), frontend chỉ diễn hoạt."""
from flask import Blueprint, current_app, jsonify, request, session

from data.items import ITEMS, POOLS
from services import gacha, spin_limit

bp = Blueprint("api", __name__)


def _error(message: str, status: int):
    return jsonify({"error": message}), status


@bp.post("/spin")
def spin():
    cfg = current_app.config
    mode = (request.get_json(silent=True) or {}).get("mode", "normal")
    if mode not in POOLS:
        return _error("Vòng quay không tồn tại.", 400)

    pending = session.get("pending_boxes", 0)

    if mode == "mystery":
        # Chỉ được mở hộp khi thật sự đã quay trúng hộp
        if pending <= 0:
            return _error("Bạn chưa có Hộp Quà Bí Ẩn nào!", 403)
        pending -= 1
    elif cfg["SPIN_LIMIT_ENABLED"]:
        remaining = spin_limit.get_remaining_seconds(
            cfg["SPIN_DATA_FILE"], cfg["SPIN_COOLDOWN_SECONDS"]
        )
        if remaining > 0:
            time_text = spin_limit.format_remaining_time(remaining)
            label = spin_limit.format_cooldown_label(cfg["SPIN_COOLDOWN_SECONDS"])
            return jsonify({
                "error": f"Mỗi {label} chỉ được quay 1 lần! Vui lòng chờ {time_text} nữa nhé.",
                "remaining_seconds": remaining,
            }), 429

    result = gacha.spin(
        mode,
        length=cfg["REEL_LENGTH"],
        win_index=cfg["REEL_WIN_INDEX"],
        near_miss_chance=cfg["NEAR_MISS_CHANCE"],
    )

    if mode != "mystery" and cfg["SPIN_LIMIT_ENABLED"]:
        spin_limit.save_spin(cfg["SPIN_DATA_FILE"])

    if ITEMS[result["winner"]].get("action") == "open_mystery":
        pending += 1

    session["pending_boxes"] = pending
    result["pending_boxes"] = pending

    if cfg["SPIN_LIMIT_ENABLED"]:
        result["remaining_seconds"] = spin_limit.get_remaining_seconds(
            cfg["SPIN_DATA_FILE"], cfg["SPIN_COOLDOWN_SECONDS"]
        )
    else:
        result["remaining_seconds"] = 0

    return jsonify(result)
