from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# At the top of your imports, add:


app = Flask(__name__)
CORS(app)  # Permite solicitudes CORS desde el frontend

# Configuración de la conexión a MySQL
# Reemplaza 'tu_usuario' y 'tu_contraseña' con tus credenciales reales.
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/formulario'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# Import models
# Import models

# Nuevo modelo para funciones laborales
class FuncionesLaborales(db.Model):
    __tablename__ = 'funciones_laborales'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    funcion = db.Column(db.String(255), nullable=False)
    circuito = db.Column(db.String(255))
    red = db.Column(db.String(255))
    municipio = db.Column(db.String(255))
    anio_ingreso = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relación
    personal = db.relationship("Personal", backref=db.backref("funciones_laborales", uselist=False))
# Modelo para el formulario de contacto (ya existente)
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

# Modelo para el registro de personal
class Personal(db.Model):
    __tablename__ = 'personal'
    id = db.Column(db.Integer, primary_key=True)
    cedula = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.String(255))
    telefono = db.Column(db.String(50))
    correo = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())


# Nuevo modelo para datos laborales
class LaboralData(db.Model):
    __tablename__ = 'laboral_data'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    puesto = db.Column(db.String(255), nullable=False)
    departamento = db.Column(db.String(255))
    salario = db.Column(db.Float)
    fecha_contratacion = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relación (suponiendo que cada persona tendrá un único registro laboral)
    personal = db.relationship("Personal", backref=db.backref("laboral_data", uselist=False))

# app.py (agregar al final del archivo)

# Modelo para la asistencia
class Asistencia(db.Model):
    __tablename__ = 'asistencia'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_llegada = db.Column(db.Time, nullable=True)
    asistio = db.Column(db.Boolean, nullable=False)
    observacion = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relación
    personal = db.relationship("Personal", backref=db.backref("asistencia", uselist=False))

# Endpoint para registrar asistencia
@app.route('/api/asistencia', methods=['POST'])
def registrar_asistencia():
    data = request.get_json()
    personal_id = data.get('personal_id')
    fecha = data.get('fecha')
    hora_llegada = data.get('hora_llegada')
    asistio = data.get('asistio')
    observacion = data.get('observacion')

    if not personal_id or not fecha or asistio is None:
        return jsonify({'error': 'Campos obligatorios faltantes'}), 400

    # Verificar si ya existe un registro de asistencia para el personal en la fecha especificada
    existing_asistencia = Asistencia.query.filter_by(personal_id=personal_id, fecha=fecha).first()
    if existing_asistencia:
        return jsonify({'error': 'El personal ya tiene un registro de asistencia para esta fecha'}), 400

    nueva_asistencia = Asistencia(
        personal_id=personal_id,
        fecha=fecha,
        hora_llegada=hora_llegada,
        asistio=asistio,
        observacion=observacion
    )

    try:
        db.session.add(nueva_asistencia)
        db.session.commit()
        return jsonify({'message': 'Asistencia registrada correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para listar asistencia
@app.route('/api/asistencia', methods=['GET'])
def listar_asistencia():
    asistencia_list = Asistencia.query.all()
    result = []
    for asistencia in asistencia_list:
        persona = Personal.query.get(asistencia.personal_id)
        result.append({
            'id': asistencia.id,
            'personal_id': asistencia.personal_id,
            'fecha': asistencia.fecha,
            'hora_llegada': asistencia.hora_llegada,
            'asistio': asistencia.asistio,
            'observacion': asistencia.observacion,
            'created_at': asistencia.created_at,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'cedula': persona.cedula
        })
    return jsonify(result), 200

# Endpoint para buscar asistencia por fecha
@app.route('/api/asistencia/buscar', methods=['GET'])
def buscar_asistencia():
    fecha = request.args.get('fecha')

    if not fecha:
        return jsonify({'error': 'Debe proporcionar una fecha'}), 400

    asistencia_list = Asistencia.query.filter_by(fecha=fecha).all()
    result = []
    for asistencia in asistencia_list:
        persona = Personal.query.get(asistencia.personal_id)
        result.append({
            'id': asistencia.id,
            'personal_id': asistencia.personal_id,
            'fecha': asistencia.fecha,
            'hora_llegada': asistencia.hora_llegada,
            'asistio': asistencia.asistio,
            'observacion': asistencia.observacion,
            'created_at': asistencia.created_at,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'cedula': persona.cedula
        })
    return jsonify(result), 200

# Endpoint para filtrar asistencia
@app.route('/api/asistencia/filtro', methods=['GET'])
def filtrar_asistencia():
    fecha = request.args.get('fecha')
    cedula = request.args.get('cedula')
    nombre = request.args.get('nombre')

    query = Asistencia.query.join(Personal, Asistencia.personal_id == Personal.id)

    if fecha:
        query = query.filter(Asistencia.fecha == fecha)
    if cedula:
        query = query.filter(Personal.cedula.like(f'%{cedula}%'))
    if nombre:
        query = query.filter(Personal.nombre.like(f'%{nombre}%'))

    asistencia_list = query.all()
    result = []
    for asistencia in asistencia_list:
        persona = Personal.query.get(asistencia.personal_id)
        result.append({
            'id': asistencia.id,
            'personal_id': asistencia.personal_id,
            'fecha': asistencia.fecha.strftime('%Y-%m-%d') if asistencia.fecha else None,
            'hora_llegada': asistencia.hora_llegada.strftime('%H:%M:%S') if asistencia.hora_llegada else None,
            'asistio': asistencia.asistio,
            'observacion': asistencia.observacion,
            'created_at': asistencia.created_at.strftime('%Y-%m-%d %H:%M:%S') if asistencia.created_at else None,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'cedula': persona.cedula
        })
    return jsonify(result), 200

    
@app.route('/api/laboral', methods=['POST'])
def registrar_laboral():
    data = request.get_json()
    personal_id = data.get('personal_id')
    if not personal_id:
        return jsonify({'error': 'El campo personal_id es obligatorio'}), 400

    # Verificar que el personal exista
    persona = Personal.query.get(personal_id)
    if not persona:
        return jsonify({'error': 'Personal no encontrado'}), 404

    # Consultar si ya existen datos laborales para ese personal (suponiendo relación 1:1)
    laboral = LaboralData.query.filter_by(personal_id=personal_id).first()
    if laboral:
        # Actualizar datos existentes
        laboral.puesto = data.get('puesto', laboral.puesto)
        laboral.departamento = data.get('departamento', laboral.departamento)
        laboral.salario = data.get('salario', laboral.salario)
        laboral.fecha_contratacion = data.get('fecha_contratacion', laboral.fecha_contratacion)
    else:
        # Crear nuevo registro laboral
        laboral = LaboralData(
            personal_id=personal_id,
            puesto=data.get('puesto'),
            departamento=data.get('departamento'),
            salario=data.get('salario'),
            fecha_contratacion=data.get('fecha_contratacion')  # Recuerda que, de ser necesario, puedes convertir el string a tipo date
        )
        db.session.add(laboral)
    try:
        db.session.commit()
        return jsonify({'message': 'Datos laborales registrados correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/funciones_laborales', methods=['POST'])
def registrar_funciones_laborales():
    data = request.get_json()
    personal_id = data.get('personal_id')
    if not personal_id:
        return jsonify({'error': 'El campo personal_id es obligatorio'}), 400

    # Verificar que el personal exista
    persona = Personal.query.get(personal_id)
    if not persona:
        return jsonify({'error': 'Personal no encontrado'}), 404

    # Consultar si ya existen funciones laborales para ese personal (suponiendo relación 1:1)
    funciones_laborales = FuncionesLaborales.query.filter_by(personal_id=personal_id).first()
    if funciones_laborales:
        # Actualizar datos existentes
        funciones_laborales.funcion = data.get('funcion', funciones_laborales.funcion)
        funciones_laborales.circuito = data.get('circuito', funciones_laborales.circuito)
        funciones_laborales.red = data.get('red', funciones_laborales.red)
        funciones_laborales.municipio = data.get('municipio', funciones_laborales.municipio)
        funciones_laborales.anio_ingreso = data.get('anio_ingreso', funciones_laborales.anio_ingreso)
    else:
        # Crear nuevo registro de funciones laborales
        funciones_laborales = FuncionesLaborales(
            personal_id=personal_id,
            funcion=data.get('funcion'),
            circuito=data.get('circuito'),
            red=data.get('red'),
            municipio=data.get('municipio'),
            anio_ingreso=data.get('anio_ingreso')
        )
        db.session.add(funciones_laborales)
    try:
        db.session.commit()
        return jsonify({'message': 'Funciones laborales registradas correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/detalle_personal/<int:personal_id>', methods=['GET'])
def detalle_personal(personal_id):
    persona = Personal.query.get(personal_id)
    if not persona:
        return jsonify({'error': 'Personal no encontrado'}), 404

    # Consultar datos laborales (si existen)
    laboral = LaboralData.query.filter_by(personal_id=personal_id).first()
    # Consultar funciones laborales (si existen)
    funciones_laborales = FuncionesLaborales.query.filter_by(personal_id=personal_id).first()

    result = {
        'id': persona.id,
        'cedula': persona.cedula,
        'nombre': persona.nombre,
        'apellido': persona.apellido,
        'direccion': persona.direccion,
        'telefono': persona.telefono,
        'correo': persona.correo,
        'created_at': persona.created_at,
        'laboral_data': {
            'puesto': laboral.puesto if laboral else None,
            'departamento': laboral.departamento if laboral else None,
            'salario': laboral.salario if laboral else None,
            'fecha_contratacion': laboral.fecha_contratacion if laboral else None,
        } if laboral else None,
        'funciones_laborales': {
            'funcion': funciones_laborales.funcion if funciones_laborales else None,
            'circuito': funciones_laborales.circuito if funciones_laborales else None,
            'red': funciones_laborales.red if funciones_laborales else None,
            'municipio': funciones_laborales.municipio if funciones_laborales else None,
            'anio_ingreso': funciones_laborales.anio_ingreso if funciones_laborales else None,
        } if funciones_laborales else None
    }
    return jsonify(result), 200

# app.py
@app.route('/api/buscar_personal', methods=['GET'])
def buscar_personal():
    cedula = request.args.get('cedula')
    if not cedula:
        return jsonify({'error': 'El campo cédula es obligatorio'}), 400

    persona = Personal.query.filter_by(cedula=cedula).first()
    if not persona:
        return jsonify({'error': 'Personal no encontrado'}), 404

    return jsonify({'id': persona.id}), 200
# Endpoint para el formulario de contacto
@app.route('/api/form', methods=['POST'])
def recibir_formulario():
    data = request.get_json()
    if not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    nuevo_usuario = Usuario(
        name=data['name'],
        email=data['email'],
        message=data['message']
    )
    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({'message': 'Formulario enviado correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint para registrar personal (POST)
@app.route('/api/personal', methods=['POST'])
def registrar_personal():
    data = request.get_json()
    # Validación básica: los campos obligatorios son cedula, nombre, apellido y correo.
    if not data.get('cedula') or not data.get('nombre') or not data.get('apellido') or not data.get('correo'):
        return jsonify({'error': 'Campos obligatorios faltantes'}), 400

    nuevo_personal = Personal(
        cedula=data['cedula'],
        nombre=data['nombre'],
        apellido=data['apellido'],
        direccion=data.get('direccion', ''),
        telefono=data.get('telefono', ''),
        correo=data['correo']
    )
    try:
        db.session.add(nuevo_personal)
        db.session.commit()
        return jsonify({'message': 'Personal registrado correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




# Endpoint para obtener la lista de personal (GET)
@app.route('/api/personal', methods=['GET'])
def listar_personal():
    personal_list = Personal.query.all()
    result = []
    for persona in personal_list:
        result.append({
            'id': persona.id,
            'cedula': persona.cedula,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'direccion': persona.direccion,
            'telefono': persona.telefono,
            'correo': persona.correo,
            'created_at': persona.created_at
        })
    return jsonify(result), 200

if __name__ == '__main__':
    # Crea las tablas si no existen (útil para desarrollo)
    with app.app_context():
        db.create_all()
    app.run(debug=True)
