from flask import Blueprint

bp = Blueprint('user', __name__)

from app.user_bp import router