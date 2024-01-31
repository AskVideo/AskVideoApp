from flask import Blueprint


bp = Blueprint('second', __name__)

from app.second_bp import router