from app.second_bp import bp
from app.database.model import User, Sessions, SessionContent, Video, MainFunc

@bp.route("/")
def index():
    # user = User("onur", "deniz", "oddd", "asd")
    # MainFunc.create(user)
    
    # session = Sessions(user_id=user.id)
    # MainFunc.create(session)

    # sess_cont = SessionContent(1, "Taşı sıksam suyunu nasıl çıkartırım?", session.id)
    # MainFunc.create(sess_cont)

    # mini_video1 = Video("Atasözleri ve Deyimler", 0, 12, session.id)
    # mini_video2 = Video("Atasözleri ve Deyimler", 14, 18, session.id)
    
    # MainFunc.create(mini_video1)
    # MainFunc.create(mini_video2)

    # print(MainFunc.get_all(User))
    # print(MainFunc.get(User, name="onur"))
    return {"data":"second"}