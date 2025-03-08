// src/components/RegistroFuncionesLaborales.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/RegistroFuncionesLaborales.css'; // Importar el archivo CSS
import { 
  FaBriefcase, FaNetworkWired, FaMapMarked, FaCity,
  FaCalendarAlt, FaSpinner, FaCheckCircle, FaExclamationCircle,
  FaSave, FaTimes, FaEdit, FaTrash, FaTable, FaSearch
} from 'react-icons/fa';
import BackButton from './common/BackButton';
import { 
  formatVEDate, 
  formatVETime, 
  formatVEDateTime, 
  formatVEShortDate, 
  formatVEDateForInput 
} from '../utils/dateUtils';

function RegistroFuncionesLaborales() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    funcion: '',
    circuito: '',
    red: '',
    municipio: '',
    anio_ingreso: '',
    personal_id: id
  });

  const [registros, setRegistros] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/funciones_laborales/personal/${id}`);
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
        await axios.put(`http://localhost:5000/api/funciones_laborales/${formData.id}`, formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setMessage({
          type: 'success',
          text: 'Registro actualizado exitosamente'
        });
      } else {
        await axios.post('http://localhost:5000/api/funciones_laborales', formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setMessage({
          type: 'success',
          text: 'Funciones laborales registradas exitosamente'
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
        await axios.delete(`http://localhost:5000/api/funciones_laborales/${id}`, {
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
      funcion: '',
      circuito: '',
      red: '',
      municipio: '',
      anio_ingreso: '',
      personal_id: id
    });
    setEditMode(false);
  };

  const filteredRegistros = registros.filter(registro => 
    registro.funcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.circuito.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.municipio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="funciones-laborales-container">
      <BackButton />
      <div className="registro-funciones-container">
        <div className="registro-section">
          <div className="registro-header">
            <h2 className="registro-title">
              <FaBriefcase className="title-icon" />
              {editMode ? 'Editar Funciones Laborales' : 'Registro de Funciones Laborales'}
            </h2>
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
                    <FaBriefcase className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="funcion"
                      value={formData.funcion}
                      onChange={handleChange}
                      placeholder="Función"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <FaNetworkWired className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="circuito"
                      value={formData.circuito}
                      onChange={handleChange}
                      placeholder="Circuito"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <FaMapMarked className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="red"
                      value={formData.red}
                      onChange={handleChange}
                      placeholder="Red"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <FaCity className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      placeholder="Municipio"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="number"
                      className="form-input"
                      name="anio_ingreso"
                      value={formData.anio_ingreso}
                      onChange={handleChange}
                      placeholder="Año de Ingreso"
                      min="1900"
                      max={new Date().getFullYear()}
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
                      {editMode ? 'Actualizar Registro' : 'Registrar'}
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
              Registros de Funciones Laborales
            </h3>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por función, circuito o municipio..."
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
                  <th>Función</th>
                  <th>Circuito</th>
                  <th>Red</th>
                  <th>Municipio</th>
                  <th>Año Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.funcion}</td>
                    <td>{registro.circuito}</td>
                    <td>{registro.red}</td>
                    <td>{registro.municipio}</td>
                    <td>{registro.anio_ingreso}</td>
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
    </div>
  );
}

export default RegistroFuncionesLaborales;