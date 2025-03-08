// src/components/RegistroPersonal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RegistroPersonal.css';
import { 
  FaUserPlus,
  FaIdCard,
  FaUser,
  FaUserTag,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaTimes,
  FaEdit,
  FaTrash,
  FaTable,
  FaSearch
} from 'react-icons/fa';
import BackButton from './common/BackButton';

function RegistroPersonal() {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    correo: ''
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
      const response = await axios.get('http://localhost:5000/api/personal');
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
        await axios.put(`http://localhost:5000/api/personal/${formData.id}`, formData);
        setMessage({
          type: 'success',
          text: 'Registro actualizado exitosamente'
        });
      } else {
        await axios.post('http://localhost:5000/api/personal', formData);
        setMessage({
          type: 'success',
          text: 'Personal registrado exitosamente'
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
    try {
      const response = await axios.put(
        `http://localhost:5000/api/personal/${registro.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setFormData(registro);
      setEditMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/personal/${id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
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
      cedula: '',
      nombre: '',
      apellido: '',
      direccion: '',
      telefono: '',
      correo: ''
    });
    setEditMode(false);
  };

  const filteredRegistros = registros.filter(registro => 
    registro.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registro.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="registro-personal-container">
      <BackButton />
      <div className="registro-section">
        <div className="registro-header">
          <h2 className="registro-title">
            <FaUserPlus className="title-icon" />
            {editMode ? 'Editar Personal' : 'Registro de Personal'}
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
                  <FaIdCard className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    id="cedula"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    placeholder="Cédula"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaUserTag className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Apellido"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaPhone className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="Correo Electrónico"
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
                    {editMode ? 'Actualizar Personal' : 'Registrar Personal'}
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
            Registros de Personal
          </h3>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por cédula, nombre o apellido..."
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
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistros.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.cedula}</td>
                  <td>{registro.nombre}</td>
                  <td>{registro.apellido}</td>
                  <td>{registro.telefono}</td>
                  <td>{registro.correo}</td>
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

export default RegistroPersonal;