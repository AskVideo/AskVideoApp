from app.main_bp import bp
from app import converter


@bp.route("/")
def index():
    print("onaaaaaananaa")
    converter.text_from_uploaded_file("/Users/onurdeniz/Documents/bitirme/test.mp4")
    return {"data": "main"}