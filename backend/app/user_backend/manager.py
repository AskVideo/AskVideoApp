import re
import logging
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from app.database.model import User, Sessions, SessionContent, Video, MainFunc

login_manager = LoginManager()

class UserAuth:
    def __init__(self):
        pass

    def login(self, data):
        try:
            email = data['e-mail']
            password = data['password']
  
            if current_user.is_authenticated:
                return Response(409, "User already logged in", {})
        
            user = MainFunc.get(User, email=email)

            if not user:
                return Response(404, "There is no account associated with this email", {})
            
            if not user.check_password(password):
                return Response(401, "Wrong password", {})
            

            login_user(user)
            return Response(200, "User login successfully", {"user_id": user.id}) 
        except Exception as e:
            logging.error("Login Error")
            logging.error(e)
            return Response(500, "Something went wrong while login.", {})

    @login_required
    def logout(self):
        try:
            logout_user()
            return Response(200, "User logout successfully", {})
        except Exception as e:
            logging.error("Logout Error")
            logging.error(e)
            return Response(500, "Something went wrong while logut.", {})

    def signup(self, data):
        try:
            name = data['name']
            surname = data['surname']
            email = data['email']
            password = data['password']

            # Check email format
            if not self._validate_email(email):
                return Response(400, "Email format is wrong", {})
            # Check sign up before
            if MainFunc.get(User, email=email):
                return Response(409, "User already exist", {})
            
            MainFunc.create(User(name, surname, email, password))
            
            return Response(200, "User created successfully", {})
        except Exception as e:
            logging.error("Sign up Error")
            logging.error(e)
            return Response(500, "Something went wrong while signing up.", {})
            

    def _validate_email(self, email):
        regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        if(re.fullmatch(regex, email)):
            return True
        return False
    
class UserActions:
    def __init__(self):
        pass

    def get_sessions(self, data):
        try:
            user_id = data["user_id"]
            user_sessions = MainFunc.get_all(Sessions, user_id=user_id)
            result = []
            for sess in user_sessions:
                result.append({"sess_id": sess.id, "title": sess.session_name})

            return Response(200, "Sessions", result)
        except Exception as e:
            logging.error("Get Sessions Error")
            logging.error(e)
            return Response(500, "Something went wrong while getting sessions")
        
    def get_session_content(self, data):
        try:
            sess_id = data["sess_id"]
            contents = MainFunc.get_all(SessionContent, session_id = sess_id)
            result = []
            for content in contents:
                video_info = {}
                if content.video:
                    video = content.video
                    video_info = {"id": video.id, "video_id": video.video_id, "start": video.start, "end": video.end}
                result.insert(content.seqsequence, {"id": content.id, "sequence": content.sequence, "text": content.content, "video_info": video_info})

            return Response(200, "Session Content", result)
        except Exception as e:
            logging.error("Get Session Content Error")
            logging.error(e)
            return Response(500, "Something went wrong while getting session content")

        


class Response:
    def __new__(self, code, msg, data):
        return {"code": code, "msg": msg, "data": data}
