from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import Usuario

def create_initial_users():
    app = create_app()
    
    with app.app_context():
        # Verificar si ya existen usuarios
        if Usuario.query.count() == 0:
            # Crear usuario administrador
            admin = Usuario(
                username='admin',
                password=generate_password_hash('admin123'),
                email='admin@example.com',
                role='ADMIN',
                is_active=True
            )

            # Crear usuario normal
            user = Usuario(
                username='user',
                password=generate_password_hash('user123'),
                email='user@example.com',
                role='USER',
                is_active=True
            )

            # Agregar usuarios a la base de datos
            db.session.add(admin)
            db.session.add(user)
            
            try:
                db.session.commit()
                print("Usuarios iniciales creados exitosamente")
                print("Admin credentials: admin / admin123")
                print("User credentials: user / user123")
            except Exception as e:
                print("Error al crear usuarios:", str(e))
                db.session.rollback()
        else:
            print("Ya existen usuarios en la base de datos")

if __name__ == '__main__':
    create_initial_users() 