"""Đăng ký các blueprint."""
from routes.api import bp as api_bp
from routes.pages import bp as pages_bp


def register_routes(app):
    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
