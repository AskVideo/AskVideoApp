from app.second_bp import bp
from app.database.model import User

@bp.route("/")
def index():
    user = User("odddd")
    user.create_user()
    return {"data": str(User.get_users())}