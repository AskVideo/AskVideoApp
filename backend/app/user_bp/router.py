from flask import request, session
from flask_login import login_required
from app.user_bp import bp
from app import user_auth
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