from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()  # Esto creará todas las tablas que no existan

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
