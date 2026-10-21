from datetime import datetime
import json
import os

SAVE_FILE = "spin_data.json"

def get_time_slot():
    hour = datetime.now().hour

    if 7 <= hour < 11:
        return "morning"
    elif 11 <= hour < 19:
        return "afternoon"
    else:
        return "evening"

def can_spin():
    slot = get_time_slot()
    today = datetime.now().strftime("%Y-%m-%d")

    if not os.path.exists(SAVE_FILE):
        return True

    with open(SAVE_FILE, "r") as f:
        data = json.load(f)

    return not (
        data.get("date") == today and
        data.get("slot") == slot
    )

def save_spin():
    data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "slot": get_time_slot()
    }

    with open(SAVE_FILE, "w") as f:
        json.dump(data, f)

# Ví dụ sử dụng
if can_spin():
    print("🎉 Được phép quay!")
    save_spin()
else:
    print("⛔ Bạn đã quay trong khung giờ này rồi!")