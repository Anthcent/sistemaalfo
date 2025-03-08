from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuración mejorada de CORS
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "expose_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True,
                 "max_age": 3600
             }
         })

    db.init_app(app)

    with app.app_context():
        # Import routes blueprint
        from .routes import routes_bp
        
        # Register the blueprint with a URL prefix
        app.register_blueprint(routes_bp, url_prefix='/api')
        
        # Import models to ensure they are recognized
        from . import models
        
        # Create database tables
        db.create_all()

    return app
