class Config:
    # Configuración de la base de datos remota
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://sql5764314:w7wLkuT8VA@sql5.freesqldatabase.com:3306/sql5764314'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'tu_clave_secreta_muy_segura'  # Cambia esto por una clave segura
    
    # Configuración CORS actualizada
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]
    CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_MAX_AGE = 3600
