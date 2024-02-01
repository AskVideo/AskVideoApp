from app.main_bp import bp
from app import converter


@bp.route("/")
def index():
    return {"data": "main"}