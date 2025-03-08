from app import create_app, db
from sqlalchemy import inspect

def check_database():
    app = create_app()
    
    with app.app_context():
        # Verificar si las tablas existen
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print("Tablas existentes:", tables)
        
        # Verificar usuarios
        from app.models import Usuario
        users = Usuario.query.all()
        print("\nUsuarios registrados:")
        for user in users:
            print(f"Username: {user.username}, Role: {user.role}")

if __name__ == '__main__':
    check_database() 