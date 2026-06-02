import os
from flask import Flask
from app.models import db

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

    db.init_app(app)

    with app.app_context():
        db.create_all()
        
    # Registered Blueprints
    from app.views import main, auth
    app.register_blueprint(main)
    app.register_blueprint(auth)

    return app