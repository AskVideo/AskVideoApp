from app.main_bp import bp

@bp.route("/")
def index():
    return {"data": "main"}