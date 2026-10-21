"""
HÔM NAY ĂN GÌ? - Vòng quay gacha chọn món
Chạy:  python app.py   rồi mở http://127.0.0.1:5000
"""
from flask import Flask

from config import Config
from routes import register_routes


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.json.ensure_ascii = False  # Trả JSON tiếng Việt có dấu
    register_routes(app)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
