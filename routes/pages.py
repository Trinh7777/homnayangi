"""Trang giao diện."""
from flask import Blueprint, current_app, render_template, session

from services import spin_limit
from services.catalog import build_game_data, build_rates_table

bp = Blueprint("pages", __name__)


@bp.get("/")
def index():
    cfg = current_app.config
    remaining = 0
    if cfg["SPIN_LIMIT_ENABLED"]:
        remaining = spin_limit.get_remaining_seconds(
            cfg["SPIN_DATA_FILE"], cfg["SPIN_COOLDOWN_SECONDS"]
        )

    return render_template(
        "index.html",
        game_data=build_game_data(
            pending_boxes=session.get("pending_boxes", 0),
            remaining_seconds=remaining,
            cooldown_seconds=cfg["SPIN_COOLDOWN_SECONDS"],
            spin_limit_enabled=cfg["SPIN_LIMIT_ENABLED"],
        ),
        rates=build_rates_table(),
    )
