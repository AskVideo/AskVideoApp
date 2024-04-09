from flask import request
from flask_login import login_required
from app.user_bp import bp
from app import user_auth, user_actions
import json


@bp.route("/login", methods=['POST'])
def login():
    data = request.get_data()
    args = json.loads(data)
    response = user_auth.login(args)
    return response

@bp.route("/logout", methods=['POST'])
@login_required
def logout():
    response = user_auth.logout()
    return response

@bp.route("/signup", methods=['POST'])
def signup():
    data = request.get_data()
    args = json.loads(data)
    response = user_auth.signup(args)
    return response

@bp.route("/sessions", methods=['POST'])
def get_sessions():
    data = request.get_data()
    args = json.loads(data)
    response = user_actions.get_sessions(args)
    return response

@bp.route("/session/content", methods=['POST'])
def get_sess_content():
    data = request.get_data()
    args = json.loads(data)
    response = user_actions.get_session_content(args)
    return response