from flask import Flask
from app.config import Config
from app.database.db_init import db
from app.database.model import *
from app.speech_to_text.converter import Converter

# Load Models
converter = Converter()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize database
    create_db(app=app)

    # Register blueprints
    from app.main_bp import bp as main_bp
    app.register_blueprint(main_bp)

    from app.second_bp import bp as second_bp
    app.register_blueprint(second_bp, url_prefix="/second")

    return app


def create_db(app):
    db.init_app(app)

    with app.app_context():
        db.create_all()