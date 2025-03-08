import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/ListadoPersonal.css';
import { 
  FaSearch, 
  FaTimes, 
  FaTable, 
  FaThLarge, 
  FaUserTie, 
  FaIdCard, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaBriefcase,
  FaTasks,
  FaEye,
  FaSpinner,
  FaUser,
  FaNetworkWired
} from 'react-icons/fa';
import BackButton from './common/BackButton';

function ListadoPersonal() {
  const [personal, setPersonal] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('table');
  const [searchCedula, setSearchCedula] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  
  // Obtener el rol del usuario del localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  const handleLocalSearch = useCallback(() => {
    let filtered = personal;
    
    if (searchCedula) {
        filtered = filtered.filter(person => 
            person.cedula?.toLowerCase().includes(searchCedula.toLowerCase())
        );
    }
    
    if (searchNombre) {
        filtered = filtered.filter(person => {
            const nombreCompleto = `${person.nombre} ${person.apellido}`.toLowerCase();
            return nombreCompleto.includes(searchNombre.toLowerCase());
        });
    }
    
    setFilteredList(filtered);
  }, [searchCedula, searchNombre, personal]);

  useEffect(() => {
    handleLocalSearch();
  }, [handleLocalSearch]);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
        const response = await axios.get('http://localhost:5000/api/personal');
        console.log('Respuesta completa:', response);
        console.log('Datos recibidos:', JSON.stringify(response.data, null, 2));
        
        const datos = response.data;
        
        if (Array.isArray(datos) && datos.length > 0) {
            setPersonal(datos);
            setFilteredList(datos);
            setError(null);
        } else {
            setError('No se encontraron registros de personal');
            setPersonal([]);
            setFilteredList([]);
        }
    } catch (error) {
        console.error('Error al obtener personal:', error);
        setError('Error al obtener personal. Por favor, inténtalo de nuevo.');
        setPersonal([]);
        setFilteredList([]);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
  }, []);

  const handleClearSearch = () => {
    setSearchCedula('');
    setSearchNombre('');
    setFilteredList(personal);
  };

  const renderTableView = () => {
    return (
        <div className="table-container">
            {loading ? (
                <div className="loading-message">Cargando...</div>
            ) : !filteredList || filteredList.length === 0 ? (
                <div className="no-data-message">
                    No se encontraron registros
                </div>
            ) : (
                <table className="personal-table">
                    <thead>
                        <tr>
                            <th><FaIdCard className="icon" /> Cédula</th>
                            <th><FaUserTie className="icon" /> Nombre</th>
                            <th><FaMapMarkerAlt className="icon" /> Dirección</th>
                            <th><FaPhone className="icon" /> Teléfono</th>
                            <th><FaEnvelope className="icon" /> Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map((persona, index) => {
                            console.log('Registro actual:', JSON.stringify(persona));
                            
                            return (
                                <tr key={index}>
                                    <td>{persona.cedula || 'N/A'}</td>
                                    <td>
                                        {persona.nombre || 'N/A'} {' '}
                                        {persona.apellido || ''}
                                    </td>
                                    <td>{persona.direccion || 'N/A'}</td>
                                    <td>{persona.telefono || 'N/A'}</td>
                                    <td>{persona.correo || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <Link
                                            to={`/registro-laboral/${persona.id}`}
                                            className="action-button table-action-button warning"
                                            title="Registrar Datos Laborales"
                                        >
                                            <FaBriefcase />
                                        </Link>
                                        <Link
                                            to={`/registro-funciones-laborales/${persona.id}`}
                                            className="action-button table-action-button secondary"
                                            title="Registrar Funciones Laborales"
                                        >
                                            <FaTasks />
                                        </Link>
                                        <Link
                                            to={`/detalle-personal/${persona.id}`}
                                            className="action-button table-action-button info"
                                            title="Ver Detalles"
                                        >
                                            <FaEye />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
  };

  const renderCardView = () => (
    <div className="cards-grid">
      {filteredList.map((personal) => (
        <div key={personal.id} className="personal-card">
          <div className="card-header">
            <div className="card-avatar">
              <FaUser />
            </div>
            <div className="card-title">
              <h3>{personal.nombre} {personal.apellido}</h3>
              <span className="card-subtitle">
                <FaIdCard className="cedula-icon" />
                <span>{personal.cedula}</span>
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="card-info">
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>{personal.telefono || 'No registrado'}</span>
              </div>
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <span>{personal.correo || 'No registrado'}</span>
              </div>
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>{personal.direccion || 'No registrada'}</span>
              </div>
            </div>
          </div>
          <div className="card-actions">
            <Link 
              to={`/detalle-personal/${personal.id}`} 
              className="action-button card-action-button detalles"
              title="Ver información detallada"
            >
              <FaEye /> Ver
            </Link>
            {userRole === 'ADMIN' && (
              <>
                <Link 
                  to={`/registro-laboral/${personal.id}`} 
                  className="action-button card-action-button info-laboral"
                  title="Gestionar información laboral"
                >
                  <FaBriefcase /> Laboral
                </Link>
                <Link 
                  to={`/registro-funciones-laborales/${personal.id}`} 
                  className="action-button card-action-button funciones"
                  title="Gestionar funciones laborales"
                >
                  <FaNetworkWired /> Funciones
                </Link>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="listado-personal-container">
      <BackButton />
      <div className="personal-header">
        <h2 className="personal-title">
          <FaUserTie className="title-icon" />
          Listado de Personal
        </h2>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-group">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por Cédula"
                value={searchCedula}
                onChange={(e) => setSearchCedula(e.target.value)}
              />
            </div>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por Nombre"
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
              />
            </div>
          </div>
          <button 
            className="clear-button"
            onClick={handleClearSearch}
          >
            <FaTimes className="icon" /> Limpiar
          </button>
        </div>
      </div>

      <div className="view-controls">
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewType === 'table' ? 'active' : ''}`}
            onClick={() => setViewType('table')}
          >
            <FaTable className="icon" /> Vista Tabla
          </button>
          <button 
            className={`toggle-button ${viewType === 'card' ? 'active' : ''}`}
            onClick={() => setViewType('card')}
          >
            <FaThLarge className="icon" /> Vista Tarjetas
          </button>
        </div>
      </div>

      {error && (
        <div className="message error">
          <FaTimes className="icon" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Cargando...</p>
        </div>
      ) : (
        viewType === 'table' ? renderTableView() : renderCardView()
      )}
    </div>
  );
}

export default ListadoPersonal;