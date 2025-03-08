from flask import request, jsonify, Blueprint, make_response, current_app, send_file
from . import db
from .models import Personal, LaboralData, FuncionesLaborales, Asistencia, Usuario, Postgrado, CursosRealizados, Reconocimientos
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from io import BytesIO
import os

# Create a blueprint for routes
routes_bp = Blueprint('routes', __name__)

# Utility function to handle CORS OPTIONS requests
def handle_options():
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response, 200

# ... (other routes)

@routes_bp.route('/listar-personas', methods=['GET', 'OPTIONS'])
def listar_personas():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        personas = Personal.query.all()
        result = [{
            'id': persona.id,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'cedula': persona.cedula
        } for persona in personas]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Error al listar personas', 'details': str(e)}), 500

@routes_bp.route('/buscar-persona/<cedula>', methods=['GET', 'OPTIONS'])
def buscar_persona(cedula):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        persona = Personal.query.filter_by(cedula=cedula).first()
        if not persona:
            return jsonify({'error': 'Persona no encontrada'}), 404
        
        return jsonify({
            'id': persona.id,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'cedula': persona.cedula
        }), 200
    except Exception as e:
        return jsonify({'error': 'Error al buscar persona', 'details': str(e)}), 500

@routes_bp.route('/registrar-postgrado', methods=['POST', 'OPTIONS'])
def registrar_postgrado():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        personal_id = data.get('personalId')
        institucion = data.get('institucion')
        titulo = data.get('titulo')
        fecha_inicio_str = data.get('fechaInicio')
        fecha_fin_str = data.get('fechaFin')
        estado = data.get('estado')

        # Validate required fields
        if not all([personal_id, institucion, titulo, fecha_inicio_str, estado]):
            return jsonify({'error': 'Campos obligatorios faltantes'}), 400

        # Validate personal_id
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        # Parse dates
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date() if fecha_fin_str else None
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido'}), 400

        # Check for duplicate postgrado
        existing_postgrado = Postgrado.query.filter_by(
            personal_id=personal_id, 
            institucion=institucion, 
            titulo=titulo
        ).first()
        
        if existing_postgrado:
            return jsonify({'error': 'Este postgrado ya está registrado para esta persona'}), 400

        # Create new postgrado
        nuevo_postgrado = Postgrado(
            personal_id=personal_id,
            institucion=institucion,
            titulo=titulo,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado
        )

        db.session.add(nuevo_postgrado)
        db.session.commit()

        return jsonify({
            'message': 'Datos de postgrado registrados correctamente', 
            'postgrado_id': nuevo_postgrado.id,
            'personal_id': personal_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar postgrado', 'details': str(e)}), 500

@routes_bp.route('/postgrado/<int:personal_id>', methods=['GET', 'OPTIONS'])
def obtener_postgrados_por_personal(personal_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        # Verify personal exists
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        # Get all postgrados for this personal
        postgrados = Postgrado.query.filter_by(personal_id=personal_id).all()
        
        result = []
        for postgrado in postgrados:
            result.append({
                'id': postgrado.id,
                'personal_id': postgrado.personal_id,
                'institucion': postgrado.institucion,
                'titulo': postgrado.titulo,
                'fecha_inicio': postgrado.fecha_inicio.strftime('%Y-%m-%d') if postgrado.fecha_inicio else None,
                'fecha_fin': postgrado.fecha_fin.strftime('%Y-%m-%d') if postgrado.fecha_fin else None,
                'estado': postgrado.estado,
                'created_at': postgrado.created_at.strftime('%Y-%m-%d %H:%M:%S') if postgrado.created_at else None
            })
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': 'Error al obtener postgrados', 'details': str(e)}), 500

@current_app.route('/api/postgrado', methods=['POST', 'OPTIONS'])
def registrar_postgrado():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        personal_id = data.get('personalId')
        institucion = data.get('institucion')
        titulo = data.get('titulo')
        fecha_inicio_str = data.get('fechaInicio')
        fecha_fin_str = data.get('fechaFin')
        estado = data.get('estado')

        # Validate required fields
        if not all([personal_id, institucion, titulo, fecha_inicio_str, estado]):
            return jsonify({'error': 'Campos obligatorios faltantes'}), 400

        # Parse dates
        try:
            fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date() if fecha_fin_str else None
        except ValueError as e:
            return jsonify({'error': 'Formato de fecha inválido', 'details': str(e)}), 400

        # Check if personal exists
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        # Check for duplicate postgrado
        existing_postgrado = Postgrado.query.filter_by(
            personal_id=personal_id, 
            institucion=institucion, 
            titulo=titulo
        ).first()
        
        if existing_postgrado:
            return jsonify({'error': 'Este postgrado ya está registrado para esta persona'}), 400

        nuevo_postgrado = Postgrado(
            personal_id=personal_id,
            institucion=institucion,
            titulo=titulo,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado
        )

        db.session.add(nuevo_postgrado)
        db.session.commit()
        return jsonify({'message': 'Datos de postgrado registrados correctamente', 'postgrado_id': nuevo_postgrado.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar postgrado', 'details': str(e)}), 500

@current_app.route('/api/postgrado/<int:personal_id>', methods=['GET', 'OPTIONS'])
def obtener_postgrado(personal_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        postgrados = Postgrado.query.filter_by(personal_id=personal_id).all()
        result = []
        for postgrado in postgrados:
            result.append({
                'id': postgrado.id,
                'personal_id': postgrado.personal_id,
                'institucion': postgrado.institucion,
                'titulo': postgrado.titulo,
                'fecha_inicio': postgrado.fecha_inicio,
                'fecha_fin': postgrado.fecha_fin,
                'estado': postgrado.estado,
                'created_at': postgrado.created_at
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Error al obtener postgrado', 'details': str(e)}), 500

@current_app.route('/api/asistencia', methods=['POST', 'OPTIONS'])
def registrar_asistencia():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        personal_id = data.get('personal_id')
        fecha = data.get('fecha')
        hora_llegada = data.get('hora_llegada')
        asistio = data.get('asistio')
        observacion = data.get('observacion')

        # Validate required fields
        if not all([personal_id, fecha, asistio is not None]):
            return jsonify({'error': 'Campos obligatorios faltantes'}), 400

        # Check if personal exists
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

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

        db.session.add(nueva_asistencia)
        db.session.commit()
        return jsonify({'message': 'Asistencia registrada correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar asistencia', 'details': str(e)}), 500

@current_app.route('/api/asistencia', methods=['GET', 'OPTIONS'])
def listar_asistencia():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
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
    except Exception as e:
        return jsonify({'error': 'Error al obtener asistencia', 'details': str(e)}), 500

@current_app.route('/api/asistencia/buscar', methods=['GET', 'OPTIONS'])
def buscar_asistencia():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
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
    except Exception as e:
        return jsonify({'error': 'Error al buscar asistencia', 'details': str(e)}), 500

@current_app.route('/api/asistencia/filtro', methods=['GET', 'OPTIONS'])
def filtrar_asistencia():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
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
    except Exception as e:
        return jsonify({'error': 'Error al filtrar asistencia', 'details': str(e)}), 500

@current_app.route('/api/laboral', methods=['POST', 'OPTIONS'])
def crear_registro_laboral():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        print("Datos recibidos:", data)  # Para debug
        
        nuevo_registro = LaboralData(
            institucion_educativa=data['institucion_educativa'],
            codigo_dependencia=data['codigo_dependencia'],
            codigo_cargo=data['codigo_cargo'],
            carga_horaria=int(data['carga_horaria']),
            anio_ingreso=int(data['anio_ingreso']),
            anios_servicio=int(data['anios_servicio']),
            personal_id=int(data['personal_id'])
        )
        
        db.session.add(nuevo_registro)
        db.session.commit()
        
        return jsonify(nuevo_registro.to_dict()), 201
    except Exception as e:
        print("Error:", str(e))  # Para debug
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@current_app.route('/api/laboral/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_laboral(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        registro = LaboralData.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(registro)
            db.session.commit()
            return jsonify({'message': 'Registro eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            registro.institucion_educativa = data['institucion_educativa']
            registro.codigo_dependencia = data['codigo_dependencia']
            registro.codigo_cargo = data['codigo_cargo']
            registro.carga_horaria = int(data['carga_horaria'])
            registro.anio_ingreso = int(data['anio_ingreso'])
            registro.anios_servicio = int(data['anios_servicio'])
            
            db.session.commit()
            return jsonify(registro.to_dict()), 200
            
    except Exception as e:
        print("Error:", str(e))  # Para debug
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@current_app.route('/api/laboral/personal/<int:personal_id>', methods=['GET'])
def obtener_registros_laborales(personal_id):
    try:
        registros = LaboralData.query.filter_by(personal_id=personal_id).all()
        return jsonify([registro.to_dict() for registro in registros])
    except Exception as e:
        print("Error:", str(e))  # Para debug
        return jsonify({'error': str(e)}), 500

@current_app.route('/api/funciones_laborales', methods=['POST', 'OPTIONS'])
def registrar_funciones_laborales():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        personal_id = data.get('personal_id')
        if not personal_id:
            return jsonify({'error': 'El campo personal_id es obligatorio'}), 400

        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        funciones_laborales = FuncionesLaborales.query.filter_by(personal_id=personal_id).first()
        if funciones_laborales:
            funciones_laborales.funcion = data.get('funcion', funciones_laborales.funcion)
            funciones_laborales.circuito = data.get('circuito', funciones_laborales.circuito)
            funciones_laborales.red = data.get('red', funciones_laborales.red)
            funciones_laborales.municipio = data.get('municipio', funciones_laborales.municipio)
            funciones_laborales.anio_ingreso = data.get('anio_ingreso', funciones_laborales.anio_ingreso)
        else:
            funciones_laborales = FuncionesLaborales(
                personal_id=personal_id,
                funcion=data.get('funcion'),
                circuito=data.get('circuito'),
                red=data.get('red'),
                municipio=data.get('municipio'),
                anio_ingreso=data.get('anio_ingreso')
            )
            db.session.add(funciones_laborales)
        db.session.commit()
        return jsonify({'message': 'Funciones laborales registradas correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar funciones laborales', 'details': str(e)}), 500

@current_app.route('/api/detalle_personal/<int:personal_id>', methods=['GET', 'OPTIONS'])
def detalle_personal(personal_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        laboral = LaboralData.query.filter_by(personal_id=personal_id).first()
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
    except Exception as e:
        return jsonify({'error': 'Error al obtener detalle personal', 'details': str(e)}), 500

@current_app.route('/api/buscar_personal', methods=['GET', 'OPTIONS'])
def buscar_personal():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        cedula = request.args.get('cedula')
        if not cedula:
            return jsonify({'error': 'El campo cédula es obligatorio'}), 400

        persona = Personal.query.filter_by(cedula=cedula).first()
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        return jsonify({'id': persona.id}), 200
    except Exception as e:
        return jsonify({'error': 'Error al buscar personal', 'details': str(e)}), 500

@current_app.route('/api/form', methods=['POST', 'OPTIONS'])
def recibir_formulario():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        if not data.get('name') or not data.get('email') or not data.get('message'):
            return jsonify({'error': 'Faltan campos obligatorios'}), 400

        nuevo_usuario = Usuario(
            name=data['name'],
            email=data['email'],
            message=data['message']
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({'message': 'Formulario enviado correctamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al enviar formulario', 'details': str(e)}), 500

@current_app.route('/api/personal', methods=['POST', 'OPTIONS'])
def registrar_personal():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        print("Datos recibidos:", data)  # Debug log
        
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
        
        print("Nuevo personal a registrar:", {
            'cedula': nuevo_personal.cedula,
            'nombre': nuevo_personal.nombre,
            'apellido': nuevo_personal.apellido,
            'correo': nuevo_personal.correo
        })  # Debug log
        
        db.session.add(nuevo_personal)
        db.session.commit()
        
        return jsonify({
            'message': 'Personal registrado correctamente',
            'id': nuevo_personal.id
        }), 201
    except Exception as e:
        db.session.rollback()
        print("Error al registrar personal:", str(e))  # Debug log
        return jsonify({'error': 'Error al registrar personal', 'details': str(e)}), 500

@current_app.route('/api/personal', methods=['GET', 'OPTIONS'])
def listar_personal():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        personal_list = Personal.query.all()
        print("Número de registros encontrados:", len(personal_list))  # Debug log
        
        result = []
        for persona in personal_list:
            print("Procesando persona:", persona.id)  # Debug log
            print("Datos:", {
                'cedula': persona.cedula,
                'nombre': persona.nombre,
                'apellido': persona.apellido,
                'direccion': persona.direccion,
                'telefono': persona.telefono,
                'correo': persona.correo
            })  # Debug log
            
            result.append({
                'id': persona.id,
                'cedula': persona.cedula,
                'nombre': persona.nombre,
                'apellido': persona.apellido,
                'direccion': persona.direccion,
                'telefono': persona.telefono,
                'correo': persona.correo,
                'created_at': persona.created_at.strftime('%Y-%m-%d %H:%M:%S') if persona.created_at else None
            })
        
        if not result:
            print("No se encontraron registros")  # Debug log
            return jsonify([]), 200
            
        return jsonify(result), 200
    except Exception as e:
        print("Error al listar personal:", str(e))  # Debug log
        return jsonify({'error': 'Error al listar personas', 'details': str(e)}), 500

@current_app.route('/api/listar-personas', methods=['GET', 'OPTIONS'])
def listar_personas():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        personal_list = Personal.query.all()
        result = []
        for persona in personal_list:
            result.append({
                'id': persona.id,
                'cedula': persona.cedula,
                'nombre': persona.nombre,
                'apellido': persona.apellido
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Error al listar personas', 'details': str(e)}), 500

@current_app.route('/api/buscar-persona/<string:cedula>', methods=['GET', 'OPTIONS'])
def buscar_persona_por_cedula(cedula):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        persona = Personal.query.filter_by(cedula=cedula).first()
        if not persona:
            return jsonify({'error': 'Persona no encontrada'}), 404

        return jsonify({
            'id': persona.id,
            'cedula': persona.cedula,
            'nombre': persona.nombre,
            'apellido': persona.apellido,
            'direccion': persona.direccion,
            'telefono': persona.telefono,
            'correo': persona.correo
        }), 200
    except Exception as e:
        return jsonify({'error': 'Error al buscar persona', 'details': str(e)}), 500

@current_app.route('/api/postgrado/<int:personal_id>', methods=['GET', 'OPTIONS'])
def obtener_postgrados_por_personal(personal_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        # Verify personal exists
        persona = Personal.query.get(personal_id)
        if not persona:
            return jsonify({'error': 'Personal no encontrado'}), 404

        # Get all postgrados for this personal
        postgrados = Postgrado.query.filter_by(personal_id=personal_id).all()
        
        result = []
        for postgrado in postgrados:
            result.append({
                'id': postgrado.id,
                'personal_id': postgrado.personal_id,
                'institucion': postgrado.institucion,
                'titulo': postgrado.titulo,
                'fecha_inicio': postgrado.fecha_inicio.strftime('%Y-%m-%d') if postgrado.fecha_inicio else None,
                'fecha_fin': postgrado.fecha_fin.strftime('%Y-%m-%d') if postgrado.fecha_fin else None,
                'estado': postgrado.estado,
                'created_at': postgrado.created_at.strftime('%Y-%m-%d %H:%M:%S') if postgrado.created_at else None
            })
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': 'Error al obtener postgrados', 'details': str(e)}), 500

@routes_bp.route('/registrar-curso', methods=['POST', 'OPTIONS'])
def registrar_curso():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        
        nuevo_curso = CursosRealizados(
            personal_id=data['personal_id'],
            nombre_curso=data['nombre_curso'],
            institucion=data['institucion'],
            fecha_inicio=datetime.strptime(data['fecha_inicio'], '%Y-%m-%d').date(),
            fecha_fin=datetime.strptime(data['fecha_fin'], '%Y-%m-%d').date() if data.get('fecha_fin') else None,
            duracion_horas=data.get('duracion_horas'),
            tipo_curso=data.get('tipo_curso'),
            certificado=data.get('certificado', False)
        )

        db.session.add(nuevo_curso)
        db.session.commit()

        return jsonify({
            'message': 'Curso registrado exitosamente',
            'id': nuevo_curso.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al registrar curso',
            'error': str(e)
        }), 500

# Endpoint para listar cursos de una persona
@current_app.route('/api/cursos/<int:personal_id>', methods=['GET'])
def listar_cursos_persona(personal_id):
    cursos = CursosRealizados.query.filter_by(personal_id=personal_id).all()
    result = []
    for curso in cursos:
        result.append({
            'id': curso.id,
            'personal_id': curso.personal_id,
            'nombre_curso': curso.nombre_curso,
            'institucion': curso.institucion,
            'fecha_inicio': curso.fecha_inicio.strftime('%Y-%m-%d') if curso.fecha_inicio else None,
            'fecha_fin': curso.fecha_fin.strftime('%Y-%m-d') if curso.fecha_fin else None,
            'duracion_horas': curso.duracion_horas,
            'tipo_curso': curso.tipo_curso,
            'certificado': curso.certificado,
            'created_at': curso.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(result), 200

@routes_bp.route('/listar-cursos-persona/<int:personal_id>', methods=['GET', 'OPTIONS'])
def listar_cursos_persona(personal_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        cursos = CursosRealizados.query.filter_by(personal_id=personal_id).all()
        result = [{
            'id': curso.id,
            'nombre_curso': curso.nombre_curso,
            'institucion': curso.institucion,
            'fecha_inicio': curso.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': curso.fecha_fin.strftime('%Y-%m-%d') if curso.fecha_fin else None,
            'duracion_horas': curso.duracion_horas,
            'tipo_curso': curso.tipo_curso,
            'certificado': curso.certificado
        } for curso in cursos]
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Error al listar cursos', 'details': str(e)}), 500

@routes_bp.route('/registrar-reconocimiento', methods=['POST', 'OPTIONS'])
def registrar_reconocimiento():
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        
        nuevo_reconocimiento = Reconocimientos(
            personal_id=data['personal_id'],
            nombre_reconocimiento=data['nombre_reconocimiento'],
            institucion=data['institucion'],
            fecha_obtencion=datetime.strptime(data['fecha_obtencion'], '%Y-%m-%d').date(),
            descripcion=data.get('descripcion'),
            reconocido=data.get('reconocido', False)
        )

        db.session.add(nuevo_reconocimiento)
        db.session.commit()

        return jsonify({
            'message': 'Reconocimiento registrado exitosamente',
            'id': nuevo_reconocimiento.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al registrar reconocimiento',
            'error': str(e)
        }), 500

@routes_bp.route('/reconocimientos/personal/<int:personal_id>', methods=['GET'])
def get_reconocimientos_by_personal(personal_id):
    try:
        reconocimientos = Reconocimientos.query.filter_by(personal_id=personal_id).all()
        return jsonify([{
            'id': rec.id,
            'personal_id': rec.personal_id,
            'nombre_reconocimiento': rec.nombre_reconocimiento,
            'institucion': rec.institucion,
            'fecha_obtencion': rec.fecha_obtencion.strftime('%Y-%m-%d'),
            'descripcion': rec.descripcion,
            'reconocido': rec.reconocido
        } for rec in reconocimientos]), 200
    except Exception as e:
        return jsonify({
            'message': 'Error al obtener reconocimientos',
            'error': str(e)
        }), 500

@routes_bp.route('/reconocimientos/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_reconocimientos(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        reconocimiento = Reconocimientos.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(reconocimiento)
            db.session.commit()
            return jsonify({'message': 'Reconocimiento eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            reconocimiento.nombre_reconocimiento = data.get('nombre_reconocimiento', reconocimiento.nombre_reconocimiento)
            reconocimiento.institucion = data.get('institucion', reconocimiento.institucion)
            reconocimiento.fecha_obtencion = datetime.strptime(data.get('fecha_obtencion'), '%Y-%m-%d').date() if data.get('fecha_obtencion') else reconocimiento.fecha_obtencion
            reconocimiento.descripcion = data.get('descripcion', reconocimiento.descripcion)
            reconocimiento.reconocido = data.get('reconocido', reconocimiento.reconocido)
            
            db.session.commit()
            return jsonify({'message': 'Reconocimiento actualizado exitosamente'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token is missing'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = Usuario.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
            if not current_user.is_active:
                return jsonify({'message': 'User is inactive'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return handle_options()

        auth_header = request.headers.get('Authorization')
        print("Auth header:", auth_header)  # Debug

        if not auth_header:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Asegurarse de que el token tenga el formato correcto
            if 'Bearer' not in auth_header:
                return jsonify({'message': 'Invalid token format'}), 401
                
            token = auth_header.split(" ")[1]
            print("Token:", token)  # Debug

            # Decodificar el token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            print("Decoded token data:", data)  # Debug

            # Verificar el usuario
            current_user = Usuario.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
            if not current_user.is_active:
                return jsonify({'message': 'User is inactive'}), 401
            if current_user.role != 'ADMIN':
                return jsonify({'message': 'Admin privileges required'}), 403

            return f(current_user, *args, **kwargs)

        except Exception as e:
            print("Error in admin_required:", str(e))  # Debug
            return jsonify({
                'message': 'Token validation error',
                'error': str(e),
                'token_received': token if 'token' in locals() else None
            }), 401

    return decorated

@routes_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return handle_options()

    auth = request.get_json()
    print("Login attempt:", auth)  # Para debug
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({
            'message': 'Missing credentials',
            'details': 'Username and password are required'
        }), 401

    user = Usuario.query.filter_by(username=auth.get('username')).first()
    print("User found:", user.username if user else None)  # Para debug
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    if check_password_hash(user.password, auth.get('password')):
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
        
    return jsonify({'message': 'Invalid password'}), 401

@routes_bp.route('/auth/register', methods=['POST', 'OPTIONS'])
@admin_required
def register(current_user):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        data = request.get_json()
        print("Register attempt by admin:", current_user.username)  # Debug
        print("Register data:", data)  # Debug

        # Validar datos requeridos
        required_fields = ['username', 'password', 'email']
        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required fields',
                'required': required_fields
            }), 400

        # Verificar duplicados
        if Usuario.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400

        # Crear nuevo usuario
        new_user = Usuario(
            username=data['username'],
            password=generate_password_hash(data['password']),
            email=data['email'],
            role=data.get('role', 'USER'),
            is_active=True
        )

        db.session.add(new_user)
        db.session.commit()

        print("User created successfully:", new_user.username)  # Debug
        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating user:", str(e))  # Debug
        return jsonify({
            'message': 'Error creating user',
            'error': str(e)
        }), 500

@routes_bp.route('/auth/verify-token', methods=['GET'])
@token_required
def verify_token(current_user):
    return jsonify(current_user.to_dict()), 200

@routes_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'API is working'}), 200

@routes_bp.route('/routes', methods=['GET'])
def list_routes():
    routes = []
    for rule in current_app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify(routes)

@routes_bp.route('/auth/check-credentials', methods=['POST'])
def check_credentials():
    data = request.get_json()
    user = Usuario.query.filter_by(username=data.get('username')).first()
    
    return jsonify({
        'username_exists': user is not None,
        'password_matches': user and check_password_hash(user.password, data.get('password')),
        'is_active': user and user.is_active if user else None,
        'role': user.role if user else None
    })

@routes_bp.route('/auth/users', methods=['GET', 'OPTIONS'])
@admin_required
def get_users(current_user):
    if request.method == 'OPTIONS':
        return handle_options()
        
    try:
        print("Obteniendo usuarios... Solicitado por:", current_user.username)
        users = Usuario.query.all()
        users_list = [user.to_dict() for user in users]
        print(f"Usuarios encontrados: {len(users_list)}")
        return jsonify(users_list), 200
    except Exception as e:
        print("Error al obtener usuarios:", str(e))
        return jsonify({
            'message': 'Error getting users',
            'error': str(e)
        }), 500

@routes_bp.route('/auth/users/<int:user_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@admin_required
def manage_user(current_user, user_id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        user = Usuario.query.get_or_404(user_id)
        
        if request.method == 'DELETE':
            if user.id == current_user.id:
                return jsonify({'message': 'No puede eliminarse a sí mismo'}), 400
            
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'Usuario eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            
            # Verificar si el username ya existe (excluyendo el usuario actual)
            if data.get('username'):
                existing_user = Usuario.query.filter(
                    Usuario.username == data['username'],
                    Usuario.id != user_id
                ).first()
                if existing_user:
                    return jsonify({'message': 'El nombre de usuario ya existe'}), 400
                user.username = data['username']
            
            # Verificar si el email ya existe (excluyendo el usuario actual)
            if data.get('email'):
                existing_user = Usuario.query.filter(
                    Usuario.email == data['email'],
                    Usuario.id != user_id
                ).first()
                if existing_user:
                    return jsonify({'message': 'El correo electrónico ya existe'}), 400
                user.email = data['email']
            
            # Actualizar contraseña solo si se proporciona una nueva
            if data.get('password'):
                user.password = generate_password_hash(data['password'])
            
            # Actualizar rol
            if data.get('role'):
                # Evitar que un admin se quite sus propios privilegios
                if user.id == current_user.id and data['role'] != 'ADMIN':
                    return jsonify({'message': 'No puede quitarse sus propios privilegios de administrador'}), 400
                user.role = data['role']
            
            db.session.commit()
            return jsonify({
                'message': 'Usuario actualizado exitosamente',
                'user': user.to_dict()
            }), 200
            
    except Exception as e:
        db.session.rollback()
        print("Error en manage_user:", str(e))  # Para debug
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

@routes_bp.route('/personal/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_personal(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        personal = Personal.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(personal)
            db.session.commit()
            return jsonify({'message': 'Registro eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            personal.cedula = data.get('cedula', personal.cedula)
            personal.nombre = data.get('nombre', personal.nombre)
            personal.apellido = data.get('apellido', personal.apellido)
            personal.direccion = data.get('direccion', personal.direccion)
            personal.telefono = data.get('telefono', personal.telefono)
            personal.correo = data.get('correo', personal.correo)
            
            db.session.commit()
            return jsonify({'message': 'Registro actualizado exitosamente'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

@routes_bp.route('/funciones_laborales/personal/<int:personal_id>', methods=['GET'])
def get_funciones_by_personal(personal_id):
    try:
        registros = FuncionesLaborales.query.filter_by(personal_id=personal_id).all()
        return jsonify([{
            'id': reg.id,
            'personal_id': reg.personal_id,
            'funcion': reg.funcion,
            'circuito': reg.circuito,
            'red': reg.red,
            'municipio': reg.municipio,
            'anio_ingreso': reg.anio_ingreso
        } for reg in registros]), 200
    except Exception as e:
        return jsonify({
            'message': 'Error al obtener registros',
            'error': str(e)
        }), 500

@routes_bp.route('/funciones_laborales/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_funciones(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        registro = FuncionesLaborales.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(registro)
            db.session.commit()
            return jsonify({'message': 'Registro eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            registro.funcion = data.get('funcion', registro.funcion)
            registro.circuito = data.get('circuito', registro.circuito)
            registro.red = data.get('red', registro.red)
            registro.municipio = data.get('municipio', registro.municipio)
            registro.anio_ingreso = data.get('anio_ingreso', registro.anio_ingreso)
            
            db.session.commit()
            return jsonify({'message': 'Registro actualizado exitosamente'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

@routes_bp.route('/postgrado/personal/<int:personal_id>', methods=['GET'])
def get_postgrados_by_personal(personal_id):
    try:
        postgrados = Postgrado.query.filter_by(personal_id=personal_id).all()
        return jsonify([{
            'id': p.id,
            'personal_id': p.personal_id,
            'institucion': p.institucion,
            'titulo': p.titulo,
            'fecha_inicio': p.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': p.fecha_fin.strftime('%Y-%m-%d') if p.fecha_fin else None,
            'estado': p.estado
        } for p in postgrados]), 200
    except Exception as e:
        return jsonify({
            'message': 'Error al obtener postgrados',
            'error': str(e)
        }), 500

@routes_bp.route('/postgrado/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_postgrado(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        postgrado = Postgrado.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(postgrado)
            db.session.commit()
            return jsonify({'message': 'Postgrado eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            postgrado.institucion = data.get('institucion', postgrado.institucion)
            postgrado.titulo = data.get('titulo', postgrado.titulo)
            postgrado.fecha_inicio = data.get('fechaInicio', postgrado.fecha_inicio)
            postgrado.fecha_fin = data.get('fechaFin') if data.get('fechaFin') else None
            postgrado.estado = data.get('estado', postgrado.estado)
            
            db.session.commit()
            return jsonify({'message': 'Postgrado actualizado exitosamente'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

@routes_bp.route('/cursos/personal/<int:personal_id>', methods=['GET'])
def get_cursos_by_personal(personal_id):
    try:
        cursos = CursosRealizados.query.filter_by(personal_id=personal_id).all()
        return jsonify([{
            'id': curso.id,
            'personal_id': curso.personal_id,
            'nombre_curso': curso.nombre_curso,
            'institucion': curso.institucion,
            'fecha_inicio': curso.fecha_inicio.strftime('%Y-%m-%d'),
            'fecha_fin': curso.fecha_fin.strftime('%Y-%m-%d') if curso.fecha_fin else None,
            'duracion_horas': curso.duracion_horas,
            'tipo_curso': curso.tipo_curso,
            'certificado': curso.certificado
        } for curso in cursos]), 200
    except Exception as e:
        return jsonify({
            'message': 'Error al obtener cursos',
            'error': str(e)
        }), 500

@routes_bp.route('/cursos/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_cursos(id):
    if request.method == 'OPTIONS':
        return handle_options()

    try:
        curso = CursosRealizados.query.get_or_404(id)
        
        if request.method == 'DELETE':
            db.session.delete(curso)
            db.session.commit()
            return jsonify({'message': 'Curso eliminado exitosamente'}), 200
            
        elif request.method == 'PUT':
            data = request.get_json()
            curso.nombre_curso = data.get('nombre_curso', curso.nombre_curso)
            curso.institucion = data.get('institucion', curso.institucion)
            curso.fecha_inicio = datetime.strptime(data.get('fecha_inicio'), '%Y-%m-%d').date() if data.get('fecha_inicio') else curso.fecha_inicio
            curso.fecha_fin = datetime.strptime(data.get('fecha_fin'), '%Y-%m-%d').date() if data.get('fecha_fin') else None
            curso.duracion_horas = data.get('duracion_horas', curso.duracion_horas)
            curso.tipo_curso = data.get('tipo_curso', curso.tipo_curso)
            curso.certificado = data.get('certificado', curso.certificado)
            
            db.session.commit()
            return jsonify({'message': 'Curso actualizado exitosamente'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Error al procesar la solicitud',
            'error': str(e)
        }), 500

@routes_bp.route('/personal/detalle/<int:id>', methods=['GET'])
def get_personal_detail(id):
    try:
        personal = Personal.query.get_or_404(id)
        return jsonify({
            'id': personal.id,
            'cedula': personal.cedula,
            'nombre': personal.nombre,
            'apellido': personal.apellido,
            'direccion': personal.direccion,
            'telefono': personal.telefono,
            'correo': personal.correo
        }), 200
    except Exception as e:
        return jsonify({
            'message': 'Error al obtener detalles del personal',
            'error': str(e)
        }), 500

def agregar_encabezado_reporte(canvas, tipo_reporte, personal):
    # Margen superior aumentado
    margin_top = 820  # Aumentamos el margen superior
    
    # Logo y título institucional con fuente más grande
    canvas.setFont("Helvetica-Bold", 20)  # Aumentamos tamaño de fuente
    canvas.drawString(50, margin_top, "FUNDACIÓN DEL NIÑO")
    
    # Subtítulo
    canvas.setFont("Helvetica", 14)
    canvas.drawString(50, margin_top - 25, "Sistema de Gestión de Personal")
    
    # Línea divisoria
    canvas.setLineWidth(2)  # Línea más gruesa
    canvas.line(50, margin_top - 35, 550, margin_top - 35)
    
    # Título del reporte con fuente más grande y centrado
    canvas.setFont("Helvetica-Bold", 18)  # Aumentamos tamaño
    titulo = f"REPORTE DE {tipo_reporte.upper()}"
    titulo_width = canvas.stringWidth(titulo, "Helvetica-Bold", 18)
    x_centered = (letter[0] - titulo_width) / 2
    canvas.drawString(x_centered, margin_top - 65, titulo)
    
    # Información del documento
    canvas.setFont("Helvetica", 10)
    fecha_actual = datetime.now().strftime("%d/%m/%Y %H:%M")
    canvas.drawString(400, margin_top, f"Fecha de emisión: {fecha_actual}")
    canvas.drawString(400, margin_top - 15, f"Documento N°: {personal.id:04d}-{datetime.now().strftime('%Y')}")
    
    # Datos del personal con más espacio
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(50, margin_top - 100, "DATOS DEL PERSONAL:")
    canvas.setFont("Helvetica", 12)
    canvas.drawString(50, margin_top - 120, f"Nombre: {personal.nombre} {personal.apellido}")
    canvas.drawString(50, margin_top - 140, f"Cédula: {personal.cedula}")
    
    # Línea divisoria final
    canvas.setLineWidth(1)
    canvas.line(50, margin_top - 160, 550, margin_top - 160)
    
    return margin_top - 180  # Retornamos la nueva posición Y para el contenido

def agregar_pie_pagina(canvas, numero_pagina):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setLineWidth(0.5)
    canvas.line(50, 65, 550, 65)
    canvas.drawString(50, 50, "FUNDACIÓN DEL NIÑO - Documento Oficial")
    canvas.drawString(250, 50, f"Página {numero_pagina}")
    canvas.drawString(450, 50, datetime.now().strftime("%d/%m/%Y %H:%M"))
    canvas.restoreState()

def nueva_pagina(canvas, tipo_reporte, personal, numero_pagina):
    canvas.showPage()
    y = agregar_encabezado_reporte(canvas, tipo_reporte, personal)
    agregar_pie_pagina(canvas, numero_pagina)
    return y

@routes_bp.route('/reportes/<tipo>/<int:personal_id>', methods=['GET'])
def generar_reporte(tipo, personal_id):
    try:
        personal = Personal.query.get_or_404(personal_id)
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        # Configuración inicial
        p.setTitle(f'Reporte de {tipo.title()} - {personal.nombre} {personal.apellido}')
        
        # Agregar encabezado y obtener posición inicial
        y = agregar_encabezado_reporte(p, tipo.title(), personal)
        agregar_pie_pagina(p, 1)
        
        # Generar el contenido específico del reporte
        if tipo == 'personal':
            generar_reporte_personal(p, personal, y)
        elif tipo == 'asistencia':
            generar_reporte_asistencia(p, personal, y)
        elif tipo == 'laboral':
            generar_reporte_laboral(p, personal, y)
        elif tipo == 'funciones':
            generar_reporte_funciones(p, personal, y)
        elif tipo == 'postgrado':
            generar_reporte_postgrado(p, personal, y)
        elif tipo == 'cursos':
            generar_reporte_cursos(p, personal, y)
        elif tipo == 'reconocimientos':
            generar_reporte_reconocimientos(p, personal, y)
        
        p.save()
        buffer.seek(0)
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'reporte_{tipo}_{personal.cedula}.pdf',
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generar_reporte_personal(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "INFORMACIÓN PERSONAL DETALLADA")
    y -= 30
    
    # Crear tabla de datos
    datos = [
        ('Nombre Completo:', f"{personal.nombre} {personal.apellido}"),
        ('Número de Cédula:', personal.cedula),
        ('Dirección:', personal.direccion),
        ('Teléfono de Contacto:', personal.telefono),
        ('Correo Electrónico:', personal.correo)
    ]
    
    # Dibujar datos en formato de tabla
    for label, valor in datos:
        # Fondo para cada fila
        p.setFillColorRGB(0.95, 0.95, 0.95)
        p.rect(50, y-15, 500, 20, fill=True)
        p.setFillColorRGB(0, 0, 0)
        
        p.setFont("Helvetica-Bold", 11)
        p.drawString(60, y-10, label)
        p.setFont("Helvetica", 11)
        p.drawString(200, y-10, str(valor))
        y -= 25

    # Agregar nota al final
    y -= 20
    p.setFont("Helvetica-Oblique", 9)
    p.drawString(50, y, "Este documento es un reporte oficial generado por el Sistema de Gestión de Personal.")

def generar_reporte_asistencia(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "REGISTRO DE ASISTENCIA")
    y -= 30
    
    # Encabezados de la tabla
    headers = ['Fecha', 'Hora Llegada', 'Estado', 'Observación']
    x_positions = [50, 150, 250, 350]
    
    # Dibujar fondo del encabezado
    p.setFillColorRGB(0.2, 0.4, 0.8)
    p.rect(50, y-15, 500, 20, fill=True)
    
    # Dibujar textos del encabezado
    p.setFillColorRGB(1, 1, 1)  # Texto blanco
    for header, x in zip(headers, x_positions):
        p.setFont("Helvetica-Bold", 10)
        p.drawString(x, y-10, header)
    y -= 25
    
    # Restablecer color negro para el texto
    p.setFillColorRGB(0, 0, 0)
    
    # Datos de asistencia
    asistencias = Asistencia.query.filter_by(personal_id=personal.id).all()
    
    for i, asistencia in enumerate(asistencias):
        if y <= 100:  # Nueva página si no hay espacio
            p = nueva_pagina(p, "ASISTENCIA", personal, p.getPageNumber() + 1)
            y = 650
        
        # Alternar colores de fondo para las filas
        if i % 2 == 0:
            p.setFillColorRGB(0.95, 0.95, 0.95)
        else:
            p.setFillColorRGB(1, 1, 1)
        p.rect(50, y-15, 500, 20, fill=True)
        
        # Restaurar color negro para el texto
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 10)
        
        p.drawString(50, y-10, asistencia.fecha.strftime('%d/%m/%Y'))
        p.drawString(150, y-10, asistencia.hora_llegada.strftime('%H:%M') if asistencia.hora_llegada else '-')
        p.drawString(250, y-10, 'PRESENTE' if asistencia.asistio else 'AUSENTE')
        p.drawString(350, y-10, asistencia.observacion or '-')
        y -= 20

def generar_reporte_laboral(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "INFORMACIÓN LABORAL")
    y -= 30
    
    laboral = LaboralData.query.filter_by(personal_id=personal.id).first()
    if laboral:
        datos = [
            ('Institución Educativa:', laboral.institucion_educativa),
            ('Código de Dependencia:', laboral.codigo_dependencia),
            ('Código de Cargo:', laboral.codigo_cargo),
            ('Carga Horaria:', f"{laboral.carga_horaria} horas"),
            ('Año de Ingreso:', str(laboral.anio_ingreso)),
            ('Años de Servicio:', f"{laboral.anios_servicio} años")
        ]
        
        for i, (label, valor) in enumerate(datos):
            # Alternar colores de fondo
            if i % 2 == 0:
                p.setFillColorRGB(0.95, 0.95, 0.95)
            else:
                p.setFillColorRGB(1, 1, 1)
            p.rect(50, y-15, 500, 20, fill=True)
            
            # Restaurar color negro para el texto
            p.setFillColorRGB(0, 0, 0)
            p.setFont("Helvetica-Bold", 11)
            p.drawString(60, y-10, label)
            p.setFont("Helvetica", 11)
            p.drawString(250, y-10, str(valor))
            y -= 25

def generar_reporte_funciones(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "FUNCIONES LABORALES")
    y -= 30
    
    funciones = FuncionesLaborales.query.filter_by(personal_id=personal.id).first()
    if funciones:
        datos = [
            ('Función Principal:', funciones.funcion),
            ('Circuito:', funciones.circuito),
            ('Red:', funciones.red),
            ('Municipio:', funciones.municipio),
            ('Año de Ingreso:', str(funciones.anio_ingreso))
        ]
        
        for i, (label, valor) in enumerate(datos):
            if i % 2 == 0:
                p.setFillColorRGB(0.95, 0.95, 0.95)
            else:
                p.setFillColorRGB(1, 1, 1)
            p.rect(50, y-15, 500, 20, fill=True)
            
            p.setFillColorRGB(0, 0, 0)
            p.setFont("Helvetica-Bold", 11)
            p.drawString(60, y-10, label)
            p.setFont("Helvetica", 11)
            p.drawString(250, y-10, str(valor))
            y -= 25

def generar_reporte_postgrado(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "ESTUDIOS DE POSTGRADO")
    y -= 30
    
    # Encabezados
    headers = ['Institución', 'Título', 'Inicio', 'Culminación', 'Estado']
    x_positions = [50, 150, 280, 380, 480]
    
    # Fondo del encabezado
    p.setFillColorRGB(0.2, 0.4, 0.8)
    p.rect(50, y-15, 500, 20, fill=True)
    
    # Texto del encabezado
    p.setFillColorRGB(1, 1, 1)
    for header, x in zip(headers, x_positions):
        p.setFont("Helvetica-Bold", 10)
        p.drawString(x, y-10, header)
    y -= 25
    
    p.setFillColorRGB(0, 0, 0)
    postgrados = Postgrado.query.filter_by(personal_id=personal.id).all()
    
    for i, postgrado in enumerate(postgrados):
        if y <= 100:
            p = nueva_pagina(p, "POSTGRADO", personal, p.getPageNumber() + 1)
            y = 650
        
        # Alternar colores de fondo
        if i % 2 == 0:
            p.setFillColorRGB(0.95, 0.95, 0.95)
        else:
            p.setFillColorRGB(1, 1, 1)
        p.rect(50, y-15, 500, 20, fill=True)
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 10)
        p.drawString(50, y-10, postgrado.institucion)
        p.drawString(150, y-10, postgrado.titulo)
        p.drawString(280, y-10, postgrado.fecha_inicio.strftime('%d/%m/%Y'))
        p.drawString(380, y-10, postgrado.fecha_fin.strftime('%d/%m/%Y') if postgrado.fecha_fin else 'En curso')
        p.drawString(480, y-10, postgrado.estado)
        y -= 20

def generar_reporte_cursos(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "CURSOS REALIZADOS")
    y -= 30
    
    # Encabezados
    headers = ['Curso', 'Institución', 'Fecha', 'Duración', 'Certificado']
    x_positions = [50, 180, 310, 400, 480]
    
    # Fondo del encabezado
    p.setFillColorRGB(0.2, 0.4, 0.8)
    p.rect(50, y-15, 500, 20, fill=True)
    
    # Texto del encabezado
    p.setFillColorRGB(1, 1, 1)
    for header, x in zip(headers, x_positions):
        p.setFont("Helvetica-Bold", 10)
        p.drawString(x, y-10, header)
    y -= 25
    
    p.setFillColorRGB(0, 0, 0)
    cursos = CursosRealizados.query.filter_by(personal_id=personal.id).all()
    
    for i, curso in enumerate(cursos):
        if y <= 100:
            p = nueva_pagina(p, "CURSOS", personal, p.getPageNumber() + 1)
            y = 650
        
        if i % 2 == 0:
            p.setFillColorRGB(0.95, 0.95, 0.95)
        else:
            p.setFillColorRGB(1, 1, 1)
        p.rect(50, y-15, 500, 20, fill=True)
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 10)
        p.drawString(50, y-10, curso.nombre_curso)
        p.drawString(180, y-10, curso.institucion)
        p.drawString(310, y-10, curso.fecha_inicio.strftime('%d/%m/%Y'))
        p.drawString(400, y-10, f"{curso.duracion_horas} horas")
        p.drawString(480, y-10, 'Sí' if curso.certificado else 'No')
        y -= 20

def generar_reporte_reconocimientos(p, personal, y):
    # Título de la sección
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "RECONOCIMIENTOS")
    y -= 30
    
    # Encabezados
    headers = ['Reconocimiento', 'Institución', 'Fecha', 'Descripción']
    x_positions = [50, 200, 300, 400]
    
    # Fondo del encabezado
    p.setFillColorRGB(0.2, 0.4, 0.8)
    p.rect(50, y-15, 500, 20, fill=True)
    
    # Texto del encabezado
    p.setFillColorRGB(1, 1, 1)
    for header, x in zip(headers, x_positions):
        p.setFont("Helvetica-Bold", 10)
        p.drawString(x, y-10, header)
    y -= 25
    
    p.setFillColorRGB(0, 0, 0)
    reconocimientos = Reconocimientos.query.filter_by(personal_id=personal.id).all()
    
    for i, reconocimiento in enumerate(reconocimientos):
        if y <= 100:
            p = nueva_pagina(p, "RECONOCIMIENTOS", personal, p.getPageNumber() + 1)
            y = 650
        
        if i % 2 == 0:
            p.setFillColorRGB(0.95, 0.95, 0.95)
        else:
            p.setFillColorRGB(1, 1, 1)
        p.rect(50, y-15, 500, 20, fill=True)
        
        p.setFillColorRGB(0, 0, 0)
        p.setFont("Helvetica", 10)
        p.drawString(50, y-10, reconocimiento.nombre_reconocimiento)
        p.drawString(200, y-10, reconocimiento.institucion)
        p.drawString(300, y-10, reconocimiento.fecha_obtencion.strftime('%d/%m/%Y'))
        p.drawString(400, y-10, reconocimiento.descripcion or '-')
        y -= 20
