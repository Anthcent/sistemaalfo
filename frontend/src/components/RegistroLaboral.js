// src/components/RegistroLaboral.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/RegistroLaboral.css';
import { 
  FaBriefcase, FaBuilding, FaBarcode, FaClock, FaCalendarAlt, FaHistory,
  FaSpinner, FaCheckCircle, FaExclamationCircle, FaSave,
  FaTimes, FaEdit, FaTrash, FaTable, FaSearch, FaIdCard
} from 'react-icons/fa';
import BackButton from './common/BackButton';
import { 
    formatVEDate, 
    formatVETime, 
    formatVEDateTime, 
    formatVEShortDate, 
    formatVEDateForInput 
} from '../utils/dateUtils';

function RegistroLaboral() {
  const { id } = useParams(); // Obtener el ID del personal de la URL
  const [personalData, setPersonalData] = useState(null);
  const [formData, setFormData] = useState({
    institucion_educativa: '',
    codigo_dependencia: '',
    codigo_cargo: '',
    carga_horaria: '',
    anio_ingreso: '',
    anios_servicio: '',
    personal_id: id // Inicializar con el ID del personal
  });

  const [registros, setRegistros] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/personal/detalle/${id}`);
        setPersonalData(response.data);
      } catch (error) {
        console.error('Error al cargar datos del personal:', error);
        setMessage({
          type: 'error',
          text: 'Error al cargar datos del personal'
        });
      }
    };

    fetchPersonalData();
    fetchRegistros();
  }, [id]);

  const fetchRegistros = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/laboral/personal/${id}`);
      setRegistros(response.data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/laboral/${formData.id}`, formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setMessage({
          type: 'success',
          text: 'Registro actualizado exitosamente'
        });
      } else {
        await axios.post('http://localhost:5000/api/laboral', formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setMessage({
          type: 'success',
          text: 'Datos laborales registrados exitosamente'
        });
      }
      
      handleClear();
      fetchRegistros();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al procesar la solicitud'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (registro) => {
    setFormData(registro);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await axios.delete(`http://localhost:5000/api/laboral/${id}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        fetchRegistros();
        setMessage({
          type: 'success',
          text: 'Registro eliminado exitosamente'
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleClear = () => {
    setFormData({
      institucion_educativa: '',
      codigo_dependencia: '',
      codigo_cargo: '',
      carga_horaria: '',
      anio_ingreso: '',
      anios_servicio: '',
      personal_id: id // Mantener el ID del personal al limpiar
    });
    setEditMode(false);
  };

  const filteredRegistros = registros.filter(registro => 
    registro.institucion_educativa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.codigo_dependencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.codigo_cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="registro-laboral-container">
      <BackButton />
      <div className="registro-section">
        <div className="registro-header">
          <h2 className="registro-title">
            <FaBriefcase className="title-icon" />
            {editMode ? 'Editar Registro Laboral' : 'Registro Laboral'}
          </h2>
          
          {personalData && (
            <div className="personal-info">
              <h3 className="personal-name">
                {personalData.nombre} {personalData.apellido}
              </h3>
              <p className="personal-cedula">
                <FaIdCard className="icon" /> Cédula: {personalData.cedula}
              </p>
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? (
              <FaCheckCircle className="icon" />
            ) : (
              <FaExclamationCircle className="icon" />
            )}
            {message.text}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="registro-form">
            <div className="form-grid">
              <div className="form-group">
                <div className="input-wrapper">
                  <FaBuilding className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="institucion_educativa"
                    value={formData.institucion_educativa}
                    onChange={handleChange}
                    placeholder="Institución Educativa"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaBarcode className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="codigo_dependencia"
                    value={formData.codigo_dependencia}
                    onChange={handleChange}
                    placeholder="Código de Dependencia"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaBarcode className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="codigo_cargo"
                    value={formData.codigo_cargo}
                    onChange={handleChange}
                    placeholder="Código del Cargo"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaClock className="input-icon" />
                  <input
                    type="number"
                    className="form-input"
                    name="carga_horaria"
                    value={formData.carga_horaria}
                    onChange={handleChange}
                    placeholder="Carga Horaria"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    className="form-input"
                    name="anio_ingreso"
                    value={formatVEDateForInput(formData.anio_ingreso)}
                    onChange={(e) => handleChange({ target: { name: 'anio_ingreso', value: formatVEDateForInput(e.target.value) } })}
                    placeholder="Año de Ingreso"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaHistory className="input-icon" />
                  <input
                    type="number"
                    className="form-input"
                    name="anios_servicio"
                    value={formData.anios_servicio}
                    onChange={handleChange}
                    placeholder="Años de Servicio"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                <FaTimes className="button-icon" />
                Limpiar
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="button-icon spinner" />
                    {editMode ? 'Actualizando...' : 'Registrando...'}
                  </>
                ) : (
                  <>
                    <FaSave className="button-icon" />
                    {editMode ? 'Actualizar Datos' : 'Registrar Datos'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="registros-section">
        <div className="registros-header">
          <h3 className="registros-title">
            <FaTable className="title-icon" />
            Registros Laborales
          </h3>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar en registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="registros-table">
            <thead>
              <tr>
                <th>Institución Educativa</th>
                <th>Código Dependencia</th>
                <th>Código Cargo</th>
                <th>Carga Horaria</th>
                <th>Año Ingreso</th>
                <th>Años Servicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistros.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.institucion_educativa}</td>
                  <td>{registro.codigo_dependencia}</td>
                  <td>{registro.codigo_cargo}</td>
                  <td>{registro.carga_horaria}</td>
                  <td>{formatVEShortDate(registro.anio_ingreso)}</td>
                  <td>{registro.anios_servicio}</td>
                  <td className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(registro)}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(registro.id)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RegistroLaboral;