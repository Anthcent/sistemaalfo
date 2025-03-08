import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/VerAsistencia.css';
import { FaSearch, FaTimes, FaTable, FaThLarge, FaClock, FaUser, FaCalendar, FaCheck, FaTimes as FaTimesCircle, FaExclamationCircle, FaUserClock, FaFilter, FaDownload, FaSpinner } from 'react-icons/fa';
import BackButton from './common/BackButton';
import { 
    formatVEDate, 
    formatVETime, 
    formatVEDateTime, 
    formatVEShortDate, 
    formatVEDateForInput 
} from '../utils/dateUtils';

function VerAsistencia() {
  const [asistenciaList, setAsistenciaList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [fecha, setFecha] = useState('');
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [viewType, setViewType] = useState('table');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAsistencia();
  }, []);

  const fetchAsistencia = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/asistencia');
      console.log('Respuesta completa:', response);
      console.log('Datos:', response.data);
      
      // Asegurarnos de que estamos accediendo a los datos correctamente
      const datos = response.data.asistencias || response.data;
      
      if (datos && datos.length > 0) {
        setAsistenciaList(datos);
        setFilteredList(datos);
        setMessage(null);
      } else {
        setMessage({ 
          type: 'info', 
          text: 'No se encontraron registros de asistencia' 
        });
        setAsistenciaList([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar los registros de asistencia' 
      });
      setAsistenciaList([]);
      setFilteredList([]);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/asistencia/filtro?fecha=${fecha}&cedula=${cedula}&nombre=${nombre}`
      );
      
      if (Array.isArray(response.data)) {
        setFilteredList(response.data);
        setMessage(
          response.data.length === 0 
            ? { type: 'info', text: 'No se encontraron registros' }
            : null
        );
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Error en el formato de datos recibidos' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al buscar registros' });
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setFecha('');
    setCedula('');
    setNombre('');
    setFilteredList(asistenciaList);
    setMessage(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatHoraLlegada = (hora) => {
    if (!hora) return 'No registrada';
    try {
        // Si la hora viene como timestamp o fecha completa
        if (hora.includes('T') || hora.includes('-')) {
            return formatVETime(new Date(hora));
        }
        // Si la hora viene en formato HH:mm:ss
        return formatVETime(new Date(`1970-01-01T${hora}`));
    } catch (error) {
        console.error('Error al formatear hora:', error);
        return 'Formato inválido';
    }
  };

  return (
    <div className="ver-asistencia-container">
      <BackButton />
      <div className="asistencia-header">
        <h2 className="asistencia-title">
          <FaUserClock className="title-icon" />
          Registro de Asistencia
        </h2>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-group">
            <div className="search-input-wrapper">
              <FaCalendar className="search-icon" />
              <input
                type="date"
                className="search-input"
                value={formatVEDateForInput(fecha)}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Buscar por Cédula"
              />
            </div>
            <div className="search-input-wrapper">
              <FaUser className="search-icon" />
              <input
                type="text"
                className="search-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Buscar por Nombre"
              />
            </div>
          </div>
          <div className="search-buttons">
            <button className="search-button" onClick={handleSearch}>
              <FaSearch className="icon" /> Buscar
            </button>
            <button className="clear-button" onClick={handleClearSearch}>
              <FaTimes className="icon" /> Limpiar
            </button>
          </div>
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

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'error' ? (
            <FaExclamationCircle className="icon" />
          ) : message.type === 'info' ? (
            <FaSearch className="icon" />
          ) : (
            <FaCheck className="icon" />
          )}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : viewType === 'table' ? (
        <div className="table-container">
          <table className="asistencia-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Hora de Llegada</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => {
                const estado = item.asistio ? 'PRESENTE' : 'AUSENTE';
                return (
                  <tr key={index} className={estado.toLowerCase()}>
                    <td>{formatVEShortDate(item.fecha)}</td>
                    <td>{item.cedula}</td>
                    <td>{item.nombre}</td>
                    <td>{formatHoraLlegada(item.hora_llegada)}</td>
                    <td>
                      <span className={`status-badge ${estado.toLowerCase()}`}>
                        {estado === 'PRESENTE' ? (
                          <FaCheck className="icon" />
                        ) : (
                          <FaTimesCircle className="icon" />
                        )}
                        {estado}
                      </span>
                    </td>
                    <td>{item.observacion || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredList.map((item, index) => {
            const estado = item.asistio ? 'PRESENTE' : 'AUSENTE';
            return (
              <div key={index} className="asistencia-card">
                <div className="card-header">
                  <h3>{item.nombre}</h3>
                </div>
                <div className="card-content">
                  <div className="info-group">
                    <span className="info-label">Fecha</span>
                    <span className="info-value">{formatVEShortDate(item.fecha)}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Cédula</span>
                    <span className="info-value">{item.cedula}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Hora de Llegada</span>
                    <span className="info-value">
                      <FaClock className="icon" style={{ marginRight: '0.5rem', color: '#1976d2' }} />
                      {formatHoraLlegada(item.hora_llegada)}
                    </span>
                  </div>
                  <div className="info-group" style={{ marginTop: 'auto' }}>
                    <span className="info-label">Estado</span>
                    <span className={`status-badge ${estado.toLowerCase()}`}>
                      {estado === 'PRESENTE' ? (
                        <FaCheck className="icon" />
                      ) : (
                        <FaTimesCircle className="icon" />
                      )}
                      {estado}
                    </span>
                  </div>
                  {item.observacion && (
                    <div className="info-group">
                      <span className="info-label">Observación</span>
                      <span className="info-value">{item.observacion}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VerAsistencia;