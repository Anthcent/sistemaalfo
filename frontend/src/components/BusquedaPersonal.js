// src/components/BusquedaPersonal.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/BusquedaPersonal.css';
import { 
  FaSearch,
  FaIdCard,
  FaUser,
  FaSpinner,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUserTag,
  FaGraduationCap,
  FaCalendarAlt,
  FaUniversity,
  FaCertificate,
  FaEye
} from 'react-icons/fa';
import BackButton from './common/BackButton';

function BusquedaPersonal() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Realizar búsqueda automática si viene con parámetro
  useEffect(() => {
    if (initialSearch) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingrese un término de búsqueda' });
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/buscar-persona/${searchTerm}`);
      const results = Array.isArray(response.data) ? response.data : [response.data];
      setSearchResults(results);
      
      if (results.length === 0) {
          setMessage({ type: 'info', text: 'No se encontraron resultados' });
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al buscar personal. Por favor, intente nuevamente.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderResultCard = (person) => (
    <div key={person.id} className="result-card">
      <div className="card-header">
        <div className="card-avatar-wrapper">
          <div className="card-avatar">
            <FaUser />
          </div>
          <div className="avatar-status" />
        </div>
        <div className="card-title">
          <h3>{person.nombre} {person.apellido}</h3>
          <span className="card-subtitle">
            <FaIdCard className="cedula-icon" />
            <span>{person.cedula}</span>
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-info">
          <div className="info-group">
            <h4 className="info-group-title">Información de Contacto</h4>
            <div className="info-item">
              <div className="info-icon-wrapper">
                <FaPhone className="info-icon" />
              </div>
              <div className="info-content">
                <span className="info-label">Teléfono</span>
                <span className="info-value">{person.telefono || 'No registrado'}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon-wrapper">
                <FaEnvelope className="info-icon" />
              </div>
              <div className="info-content">
                <span className="info-label">Correo</span>
                <span className="info-value">{person.correo || 'No registrado'}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon-wrapper">
                <FaMapMarkerAlt className="info-icon" />
              </div>
              <div className="info-content">
                <span className="info-label">Dirección</span>
                <span className="info-value">{person.direccion || 'No registrada'}</span>
              </div>
            </div>
          </div>

          {person.postgrado && person.postgrado.length > 0 && (
            <div className="info-group">
              <h4 className="info-group-title">
                <FaGraduationCap className="section-icon" />
                Formación Académica
              </h4>
              <div className="education-list">
                {person.postgrado.map((pg, index) => (
                  <div key={index} className="education-item">
                    <div className="education-icon">
                      <FaUniversity />
                    </div>
                    <div className="education-details">
                      <span className="education-title">{pg.titulo}</span>
                      <span className="education-institution">{pg.universidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card-actions">
        <Link 
          to={`/detalle-personal/${person.id}`}
          className="action-button detalles"
          title="Ver información detallada"
        >
          <FaEye /> Ver Detalles Completos
        </Link>
      </div>
    </div>
  );

  return (
    <div className="busqueda-personal-container">
      <BackButton />
      {/* Elementos decorativos */}
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>

      <div className="busqueda-header">
        <h2 className="busqueda-title">
          <FaSearch className="title-icon" />
          Búsqueda de Personal
        </h2>
        <p className="busqueda-subtitle">
          Encuentra información detallada del personal ingresando su cédula o nombre
        </p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <FaExclamationCircle className="message-icon" />
          {message.text}
        </div>
      )}

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por cédula o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Buscando...
              </>
            ) : (
              <>
                <FaSearch />
                Buscar
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="message error">
          <FaExclamationCircle className="message-icon" />
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="results-section">
          <h3 className="results-title">Resultados de la búsqueda</h3>
          <div className="results-grid">
            {searchResults.map(renderResultCard)}
          </div>
        </div>
      )}
    </div>
  );
}

export default BusquedaPersonal;