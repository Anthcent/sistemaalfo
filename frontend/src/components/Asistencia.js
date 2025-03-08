import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../css/Asistencia.css';
import { FaSearch, FaTimes, FaTable, FaThLarge, FaClock, FaCheck } from 'react-icons/fa';
import BackButton from './common/BackButton';
import { 
    formatVEDate, 
    formatVETime, 
    formatVEDateTime, 
    formatVEShortDate, 
    formatVEDateForInput 
} from '../utils/dateUtils';

function Asistencia() {
  const [personalList, setPersonalList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState('table');
  const [searchCedula, setSearchCedula] = useState('');
  const [searchNombre, setSearchNombre] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonal();
  }, []);

  const handleLocalSearch = useCallback(() => {
    let filtered = personalList;
    
    if (searchCedula) {
      filtered = filtered.filter(person => 
        person.cedula.toLowerCase().includes(searchCedula.toLowerCase())
      );
    }
    
    if (searchNombre) {
      filtered = filtered.filter(person => 
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchNombre.toLowerCase())
      );
    }
    
    setFilteredList(filtered);
  }, [searchCedula, searchNombre, personalList]);

  useEffect(() => {
    handleLocalSearch();
  }, [handleLocalSearch]);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/personal');
      console.log('Respuesta completa:', response);
      console.log('Estructura de datos:', {
        data: response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length,
        firstItem: response.data[0]
      });
      
      // Asegurarse de que tenemos un array de datos
      let datos = [];
      if (response.data && typeof response.data === 'object') {
        datos = Array.isArray(response.data) ? response.data : Object.values(response.data);
      }

      if (datos.length > 0) {
        console.log('Primer registro:', datos[0]);
        setPersonalList(datos);
        setFilteredList(datos);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'No se encontraron registros de personal' });
        setPersonalList([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al cargar el personal' });
      setPersonalList([]);
      setFilteredList([]);
    }
    setLoading(false);
  };

  const handleAsistenciaChange = (id, field, value) => {
    setAsistencia(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        asistio: field === 'hora_llegada' ? !!value : (field === 'asistio' ? value : prev[id]?.asistio)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const now = new Date();
    const formattedDate = formatVEShortDate(now);
    const formattedTime = formatVETime(now);

    try {
      const requests = Object.keys(asistencia).map(id => {
        const data = {
          personal_id: id,
          fecha: formattedDate,
          hora_llegada: asistencia[id].hora_llegada || null,
          asistio: asistencia[id].asistio || false,
          observacion: asistencia[id].observacion || ''
        };
        return axios.post('http://localhost:5000/api/asistencia', data);
      });

      await Promise.all(requests);
      setMessage({ type: 'success', text: 'Asistencia registrada correctamente' });
      // Limpiar los datos después de un registro exitoso
      setAsistencia({});
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al registrar la asistencia' });
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setSearchCedula('');
    setSearchNombre('');
    setFilteredList(personalList);
  };

  return (
    <div className="asistencia-container">
      <BackButton />
      <div className="asistencia-header">
        <h2 className="asistencia-title">Control de Asistencia</h2>
        <div className="date-selector">
          <FaClock className="icon" />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="date-input"
            required
          />
        </div>
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

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <FaCheck className="icon" /> : <FaTimes className="icon" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="asistencia-form">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="no-data-message">
            No se encontraron registros
          </div>
        ) : viewType === 'table' ? (
          <div className="table-container">
            <table className="asistencia-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Asistencia</th>
                  <th>Hora Llegada</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(persona => (
                  <tr key={persona.id} className={asistencia[persona.id]?.asistio ? 'presente' : ''}>
                    <td className="nombre-cell">
                      {persona.nombre} {persona.apellido}
                    </td>
                    <td className="cedula-cell">{persona.cedula}</td>
                    <td className="asistencia-cell">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={asistencia[persona.id]?.asistio || false}
                          onChange={(e) => handleAsistenciaChange(persona.id, 'asistio', e.target.checked)}
                          className="custom-checkbox"
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td className="hora-cell">
                      <input
                        type="time"
                        value={asistencia[persona.id]?.hora_llegada || ''}
                        onChange={(e) => handleAsistenciaChange(persona.id, 'hora_llegada', e.target.value)}
                        className="time-input"
                      />
                    </td>
                    <td className="observacion-cell">
                      <input
                        type="text"
                        value={asistencia[persona.id]?.observacion || ''}
                        onChange={(e) => handleAsistenciaChange(persona.id, 'observacion', e.target.value)}
                        placeholder="Agregar observación"
                        className="observation-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredList.map(persona => (
              <div 
                key={persona.id} 
                className={`asistencia-card ${asistencia[persona.id]?.asistio ? 'presente' : ''}`}
                onClick={() => {
                  const currentState = asistencia[persona.id]?.asistio || false;
                  handleAsistenciaChange(persona.id, 'asistio', !currentState);
                  if (!currentState && !asistencia[persona.id]?.hora_llegada) {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    handleAsistenciaChange(persona.id, 'hora_llegada', currentTime);
                  }
                }}
              >
                <div className="card-header">
                  <h3 className="card-name">{persona.nombre} {persona.apellido}</h3>
                  <span className="card-cedula">{persona.cedula}</span>
                </div>
                <div className="card-content">
                  <div className="card-field attendance-status">
                    <div className="status-indicator">
                      <span className="status-text">
                        {asistencia[persona.id]?.asistio ? 'Presente' : 'Ausente'}
                      </span>
                    </div>
                  </div>
                  <div className="card-field time-field">
                    <input
                      type="time"
                      className="time-input"
                      value={asistencia[persona.id]?.hora_llegada || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleAsistenciaChange(persona.id, 'hora_llegada', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="card-field">
                    <textarea
                      className="observation-input"
                      value={asistencia[persona.id]?.observacion || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleAsistenciaChange(persona.id, 'observacion', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Observación..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || Object.keys(asistencia).length === 0}
          >
            {loading ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Asistencia;