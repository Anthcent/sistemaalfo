import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/DetallePersonal.css';
import { 
  FaUserTie, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaBuilding, FaBarcode, FaClock, FaCalendarAlt,
  FaTasks, FaNetworkWired, FaMapMarked, FaCity,
  FaGraduationCap, FaUniversity, FaHistory,
  FaSpinner, FaExclamationCircle, FaFilter,
  FaAward, FaBook, FaCertificate
} from 'react-icons/fa';
import BackButton from './common/BackButton';

function DetallePersonal() {
  const { id } = useParams();
  const [personal, setPersonal] = useState(null);
  const [datosLaborales, setDatosLaborales] = useState([]);
  const [funciones, setFunciones] = useState(null);
  const [postgrado, setPostgrado] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [reconocimientos, setReconocimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [
          personalRes, 
          laboralRes, 
          funcionesRes,
          postgradoRes, 
          cursosRes, 
          reconocimientosRes
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/personal/detalle/${id}`),
          axios.get(`http://localhost:5000/api/laboral/personal/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/funciones_laborales/personal/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/postgrado/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/cursos/personal/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/reconocimientos/personal/${id}`).catch(() => ({ data: [] }))
        ]);

        setPersonal(personalRes.data);
        setDatosLaborales(Array.isArray(laboralRes.data) ? laboralRes.data : []);
        setFunciones(funcionesRes.data);
        setPostgrado(Array.isArray(postgradoRes.data) ? postgradoRes.data : []);
        setCursos(Array.isArray(cursosRes.data) ? cursosRes.data : []);
        setReconocimientos(Array.isArray(reconocimientosRes.data) ? reconocimientosRes.data : []);

      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderLaboralInfo = () => (
    <div className="detail-card">
      <div className="card-header">
        <FaBriefcase className="card-icon" />
        <h3>Información Laboral</h3>
      </div>
      <div className="card-content">
        {datosLaborales && datosLaborales.length > 0 ? (
          datosLaborales.map((laboral) => (
            <div key={laboral.id} className="laboral-card">
              <div className="info-grid">
                <div className="info-item">
                  <FaBuilding className="info-icon" />
                  <span><strong>Institución Educativa:</strong> {laboral.institucion_educativa}</span>
                </div>
                <div className="info-item">
                  <FaBarcode className="info-icon" />
                  <span><strong>Código Dependencia:</strong> {laboral.codigo_dependencia}</span>
                </div>
                <div className="info-item">
                  <FaBriefcase className="info-icon" />
                  <span><strong>Código Cargo:</strong> {laboral.codigo_cargo}</span>
                </div>
                <div className="info-item">
                  <FaClock className="info-icon" />
                  <span><strong>Carga Horaria:</strong> {laboral.carga_horaria} horas</span>
                </div>
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <span><strong>Año de Ingreso:</strong> {laboral.anio_ingreso}</span>
                </div>
                <div className="info-item">
                  <FaHistory className="info-icon" />
                  <span><strong>Años de Servicio:</strong> {laboral.anios_servicio}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <FaExclamationCircle className="icon" />
            <p>No hay información laboral registrada</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="detail-card">
      <div className="card-header">
        <FaUserTie className="card-icon" />
        <h3>Información Personal</h3>
      </div>
      <div className="card-content">
        <div className="info-item">
          <FaIdCard className="info-icon" />
          <span><strong>Cédula:</strong> {personal?.cedula}</span>
        </div>
        <div className="info-item">
          <FaUserTie className="info-icon" />
          <span><strong>Nombre:</strong> {personal?.nombre} {personal?.apellido}</span>
        </div>
        <div className="info-item">
          <FaEnvelope className="info-icon" />
          <span><strong>Correo:</strong> {personal?.correo}</span>
        </div>
        <div className="info-item">
          <FaPhone className="info-icon" />
          <span><strong>Teléfono:</strong> {personal?.telefono || 'No especificado'}</span>
        </div>
        <div className="info-item">
          <FaMapMarkerAlt className="info-icon" />
          <span><strong>Dirección:</strong> {personal?.direccion || 'No especificada'}</span>
        </div>
      </div>
    </div>
  );

  const renderFuncionesInfo = () => (
    <div className="detail-card">
      <div className="card-header">
        <FaTasks className="card-icon" />
        <h3>Funciones Laborales</h3>
      </div>
      <div className="card-content">
        {funciones && (
          <>
            <div className="info-item">
              <FaTasks className="info-icon" />
              <span><strong>Función:</strong> {funciones.funcion}</span>
            </div>
            <div className="info-item">
              <FaNetworkWired className="info-icon" />
              <span><strong>Circuito:</strong> {funciones.circuito || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <FaMapMarked className="info-icon" />
              <span><strong>Red:</strong> {funciones.red || 'No especificada'}</span>
            </div>
            <div className="info-item">
              <FaCity className="info-icon" />
              <span><strong>Municipio:</strong> {funciones.municipio || 'No especificado'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderPostgradoCards = () => (
    postgrado.length > 0 ? (
      postgrado.map((item, index) => (
        <div key={index} className="detail-card">
          <div className="card-header">
            <FaGraduationCap className="card-icon" />
            <h3>Postgrado</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <FaUniversity className="info-icon" />
              <span><strong>Institución:</strong> {item.institucion}</span>
            </div>
            <div className="info-item">
              <FaGraduationCap className="info-icon" />
              <span><strong>Título:</strong> {item.titulo}</span>
            </div>
            <div className="info-item">
              <FaClock className="info-icon" />
              <span><strong>Fecha Inicio:</strong> {new Date(item.fecha_inicio).toLocaleDateString()}</span>
            </div>
            {item.fecha_fin && (
              <div className="info-item">
                <FaClock className="info-icon" />
                <span><strong>Fecha Fin:</strong> {new Date(item.fecha_fin).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="detail-card">
        <div className="card-header">
          <FaGraduationCap className="card-icon" />
          <h3>Postgrado</h3>
        </div>
        <div className="card-content">
          <div className="info-item">
            <FaExclamationCircle className="info-icon" style={{ color: '#f44336' }} />
            <span>No hay estudios de postgrado registrados</span>
          </div>
        </div>
      </div>
    )
  );

  const renderCursosCards = () => (
    cursos.length > 0 ? (
      cursos.map((curso, index) => (
        <div key={index} className="detail-card">
          <div className="card-header">
            <FaBook className="card-icon" />
            <h3>Curso</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <FaBook className="info-icon" />
              <span><strong>Nombre:</strong> {curso.nombre_curso}</span>
            </div>
            <div className="info-item">
              <FaUniversity className="info-icon" />
              <span><strong>Institución:</strong> {curso.institucion}</span>
            </div>
            <div className="info-item">
              <FaCalendarAlt className="info-icon" />
              <span><strong>Fecha Inicio:</strong> {new Date(curso.fecha_inicio).toLocaleDateString()}</span>
            </div>
            {curso.fecha_fin && (
              <div className="info-item">
                <FaCalendarAlt className="info-icon" />
                <span><strong>Fecha Fin:</strong> {new Date(curso.fecha_fin).toLocaleDateString()}</span>
              </div>
            )}
            {curso.duracion_horas && (
              <div className="info-item">
                <FaClock className="info-icon" />
                <span><strong>Duración:</strong> {curso.duracion_horas} horas</span>
              </div>
            )}
            {curso.tipo_curso && (
              <div className="info-item">
                <FaBook className="info-icon" />
                <span><strong>Tipo:</strong> {curso.tipo_curso}</span>
              </div>
            )}
            <div className="info-item">
              <FaCertificate className="info-icon" />
              <span><strong>Certificado:</strong> {curso.certificado ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="detail-card">
        <div className="card-header">
          <FaBook className="card-icon" />
          <h3>Cursos</h3>
        </div>
        <div className="card-content">
          <div className="info-item">
            <FaExclamationCircle className="info-icon" style={{ color: '#f44336' }} />
            <span>No hay cursos registrados</span>
          </div>
        </div>
      </div>
    )
  );

  const renderReconocimientosCards = () => (
    reconocimientos.length > 0 ? (
      reconocimientos.map((reconocimiento, index) => (
        <div key={index} className="detail-card">
          <div className="card-header">
            <FaAward className="card-icon" />
            <h3>Reconocimiento</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <FaAward className="info-icon" />
              <span><strong>Nombre:</strong> {reconocimiento.nombre_reconocimiento}</span>
            </div>
            <div className="info-item">
              <FaUniversity className="info-icon" />
              <span><strong>Institución:</strong> {reconocimiento.institucion}</span>
            </div>
            <div className="info-item">
              <FaCalendarAlt className="info-icon" />
              <span><strong>Fecha:</strong> {new Date(reconocimiento.fecha_obtencion).toLocaleDateString()}</span>
            </div>
            {reconocimiento.descripcion && (
              <div className="info-item">
                <FaBook className="info-icon" />
                <span><strong>Descripción:</strong> {reconocimiento.descripcion}</span>
              </div>
            )}
            <div className="info-item">
              <FaCertificate className="info-icon" />
              <span><strong>Reconocido:</strong> {reconocimiento.reconocido ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="detail-card">
        <div className="card-header">
          <FaAward className="card-icon" />
          <h3>Reconocimientos</h3>
        </div>
        <div className="card-content">
          <div className="info-item">
            <FaExclamationCircle className="info-icon" style={{ color: '#f44336' }} />
            <span>No hay reconocimientos registrados</span>
          </div>
        </div>
      </div>
    )
  );

  const renderContent = () => {
    switch (activeFilter) {
      case 'personal':
        return renderPersonalInfo();
      case 'laboral':
        return renderLaboralInfo();
      case 'funciones':
        return renderFuncionesInfo();
      case 'postgrado':
        return renderPostgradoCards();
      case 'cursos':
        return renderCursosCards();
      case 'reconocimientos':
        return renderReconocimientosCards();
      case 'todos':
      default:
        return (
          <>
            {renderPersonalInfo()}
            {renderLaboralInfo()}
            {renderFuncionesInfo()}
            {renderPostgradoCards()}
            {renderCursosCards()}
            {renderReconocimientosCards()}
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="detalle-personal-container">
      <BackButton />
      <div className="detalle-header">
        <h1 className="detalle-title">
          <FaUserTie className="title-icon" />
          Detalle del Personal
        </h1>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <FaFilter className="filter-icon" />
          <h2 className="filter-title">Filtrar información</h2>
        </div>
        <div className="filter-options">
          <button
            className={`filter-button ${activeFilter === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('todos')}
          >
            <FaUserTie className="button-icon" />
            Todos
          </button>
          <button
            className={`filter-button ${activeFilter === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveFilter('personal')}
          >
            <FaIdCard className="button-icon" />
            Personal
          </button>
          <button
            className={`filter-button ${activeFilter === 'laboral' ? 'active' : ''}`}
            onClick={() => setActiveFilter('laboral')}
          >
            <FaBriefcase className="button-icon" />
            Laboral
          </button>
          <button
            className={`filter-button ${activeFilter === 'funciones' ? 'active' : ''}`}
            onClick={() => setActiveFilter('funciones')}
          >
            <FaTasks className="button-icon" />
            Funciones
          </button>
          <button
            className={`filter-button ${activeFilter === 'postgrado' ? 'active' : ''}`}
            onClick={() => setActiveFilter('postgrado')}
          >
            <FaGraduationCap className="button-icon" />
            Postgrado
          </button>
          <button
            className={`filter-button ${activeFilter === 'cursos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cursos')}
          >
            <FaBook className="button-icon" />
            Cursos
          </button>
          <button
            className={`filter-button ${activeFilter === 'reconocimientos' ? 'active' : ''}`}
            onClick={() => setActiveFilter('reconocimientos')}
          >
            <FaAward className="button-icon" />
            Reconocimientos
          </button>
        </div>
      </div>

      <div className="detail-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default DetallePersonal;