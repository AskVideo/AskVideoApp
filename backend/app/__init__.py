from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database.db_init import db
from app.database.model import *
from app.video_backend.converter import Converter
from app.user_backend.manager import UserAuth, UserActions, login_manager

# Load Models
converter = Converter()
user_auth = UserAuth()
user_actions = UserActions()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize database
    create_db(app=app)

    # Init app
    login_manager.init_app(app)
    @login_manager.user_loader
    def load_user(user_id):
        return MainFunc.get(User, id=int(user_id))
    
    CORS(app, origins='http://localhost:3001')
    
    # Register blueprints
    from app.user_bp import bp as user_bp
    app.register_blueprint(user_bp)

    from app.video_bp import bp as video_bp
    app.register_blueprint(video_bp, url_prefix="/video")

    return app


def create_db(app):
    db.init_app(app)

    with app.app_context():
        db.create_all()