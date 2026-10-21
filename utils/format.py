"""Hàm định dạng hiển thị."""


def format_price(price: int | None) -> str:
    """20000 -> '20.000đ'; None -> '???'."""
    if price is None:
        return "???"
    return f"{price:,.0f}đ".replace(",", ".")


def format_percent(p: float) -> str:
    """0.2 -> '20%'; 0.045 -> '4.5%'."""
    value = p * 100
    text = f"{value:.2f}".rstrip("0").rstrip(".")
    return f"{text}%"
