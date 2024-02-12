from flask import request, session
from flask_login import login_required
from app.user_bp import bp
from app import user_auth


@bp.route("/login", methods=['POST'])
def login():
    data = request.form
    response = user_auth.login(data, session)
    return response

@bp.route("/logout", methods=['POST'])
@login_required
def logout():
    response = user_auth.logout(session)
    return response

@bp.route("/signup", methods=['POST'])
def signup():
    data = request.form
    response = user_auth.signup(data)
    return response