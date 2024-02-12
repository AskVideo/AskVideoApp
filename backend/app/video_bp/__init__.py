from flask import Blueprint


bp = Blueprint('video', __name__)

from app.video_bp import router