from . import db






class Postgrado(db.Model):
    __tablename__ = 'postgrado'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    institucion = db.Column(db.String(255), nullable=False)
    titulo = db.Column(db.String(255), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date)
    estado = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    personal = db.relationship("Personal", backref=db.backref("postgrado", lazy=True))



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

    personal = db.relationship("Personal", backref=db.backref("funciones_laborales", uselist=False))

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    role = db.Column(db.String(20), nullable=False, default='USER')  # 'ADMIN' or 'USER'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

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

class LaboralData(db.Model):
    __tablename__ = 'laboral'
    
    id = db.Column(db.Integer, primary_key=True)
    institucion_educativa = db.Column(db.String(200), nullable=False)
    codigo_dependencia = db.Column(db.String(50), nullable=False)
    codigo_cargo = db.Column(db.String(50), nullable=False)
    carga_horaria = db.Column(db.Integer, nullable=False)
    anio_ingreso = db.Column(db.Integer, nullable=False)
    anios_servicio = db.Column(db.Integer, nullable=False)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    
    # Relación con Personal
    personal = db.relationship('Personal', backref=db.backref('laboral_data', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'institucion_educativa': self.institucion_educativa,
            'codigo_dependencia': self.codigo_dependencia,
            'codigo_cargo': self.codigo_cargo,
            'carga_horaria': self.carga_horaria,
            'anio_ingreso': self.anio_ingreso,
            'anios_servicio': self.anios_servicio,
            'personal_id': self.personal_id
        }

class Asistencia(db.Model):
    __tablename__ = 'asistencia'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora_llegada = db.Column(db.Time, nullable=True)
    asistio = db.Column(db.Boolean, nullable=False)
    observacion = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    personal = db.relationship("Personal", backref=db.backref("asistencia", uselist=False))


class CursosRealizados(db.Model):
    __tablename__ = 'cursos_realizados'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    nombre_curso = db.Column(db.String(255), nullable=False)
    institucion = db.Column(db.String(255), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date)
    duracion_horas = db.Column(db.Integer)
    tipo_curso = db.Column(db.String(100))
    certificado = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relación
    personal = db.relationship("Personal", backref=db.backref("cursos_realizados", lazy=True))

class Reconocimientos(db.Model):
    __tablename__ = 'reconocimientos'
    id = db.Column(db.Integer, primary_key=True)
    personal_id = db.Column(db.Integer, db.ForeignKey('personal.id'), nullable=False)
    nombre_reconocimiento = db.Column(db.String(255), nullable=False)
    institucion = db.Column(db.String(255), nullable=False)
    fecha_obtencion = db.Column(db.Date, nullable=False)
    descripcion = db.Column(db.Text)
    reconocido = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relación
    personal = db.relationship("Personal", backref=db.backref("reconocimientos", lazy=True))
