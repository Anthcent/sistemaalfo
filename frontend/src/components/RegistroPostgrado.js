// Frontend/src/components/RegistroPostgrado.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RegistroPostgrado.css';
import { 
    FaSearch, 
    FaUser, 
    FaIdCard, 
    FaUniversity, 
    FaGraduationCap,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationCircle,
    FaSpinner,
    FaSave,
    FaEdit,
    FaTrash,
    FaTimes
} from 'react-icons/fa';
import { FaTable } from 'react-icons/fa';
import BackButton from './common/BackButton';
import { 
    formatVEDate, 
    formatVETime, 
    formatVEDateTime, 
    formatVEShortDate, 
    formatVEDateForInput 
} from '../utils/dateUtils';

const RegistroPostgrado = () => {
  const [formData, setFormData] = useState({
    personalId: '',
    institucion: '',
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });

  const [personasList, setPersonasList] = useState([]);
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postgradosExistentes, setPostgradosExistentes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/listar-personas');
      setPersonasList(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar la lista de personas:', error);
      setError('No se pudo cargar la lista de personas');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError(null);
    setSuccess(null);
  };

  const handleSelectChange = async (e) => {
    const personalId = e.target.value;
    setFormData({
      ...formData,
      personalId: personalId
    });
    
    if (personalId) {
      // Buscar la persona seleccionada
      const persona = personasList.find(p => p.id === parseInt(personalId));
      setPersonaEncontrada(persona);
      setSelectedPersonId(personalId);
      
      // Cargar postgrados existentes
      try {
        const response = await axios.get(`/postgrado/personal/${personalId}`);
        setPostgradosExistentes(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar postgrados:', error);
        setPostgradosExistentes([]);
      }
    } else {
      setPersonaEncontrada(null);
      setPostgradosExistentes([]);
    }
  };

  const handleBusquedaCedulaChange = (e) => {
    setBusquedaCedula(e.target.value);
  };

  const handleBusquedaCedula = async () => {
    if (!busquedaCedula) {
      setError('Ingrese una cédula para buscar');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/buscar-persona/${busquedaCedula}`);
      const persona = response.data;
      setPersonaEncontrada(persona);
      setSelectedPersonId(persona.id);
      setFormData({
        ...formData,
        personalId: persona.id
      });

      // Cargar postgrados existentes
      const postgradosResponse = await axios.get(`/postgrado/personal/${persona.id}`);
      setPostgradosExistentes(postgradosResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error al buscar persona:', error);
      setPersonaEncontrada(null);
      setPostgradosExistentes([]);
      setError('No se encontró una persona con esa cédula');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postgrado) => {
    setFormData({
      personalId: postgrado.personal_id,
      institucion: postgrado.institucion,
      titulo: postgrado.titulo,
      fechaInicio: postgrado.fecha_inicio,
      fechaFin: postgrado.fecha_fin || '',
      estado: postgrado.estado
    });
    setEditMode(true);
    setEditingId(postgrado.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/postgrado/${id}`);
      setSuccess('Postgrado eliminado exitosamente');
      // Recargar la lista de postgrados
      const response = await axios.get(`http://localhost:5000/api/postgrado/personal/${selectedPersonId}`);
      setPostgradosExistentes(response.data);
    } catch (error) {
      setError('Error al eliminar el postgrado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/postgrado/${editingId}`, formData);
        setSuccess('Postgrado actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5000/api/postgrado', formData);
        setSuccess('Postgrado registrado exitosamente');
      }

      // Recargar postgrados
      const response = await axios.get(`http://localhost:5000/api/postgrado/personal/${selectedPersonId}`);
      setPostgradosExistentes(response.data);
      
      // Limpiar formulario
      handleClear();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      personalId: selectedPersonId,
      institucion: '',
      titulo: '',
      fechaInicio: '',
      fechaFin: '',
      estado: ''
    });
    setEditMode(false);
    setEditingId(null);
  };

  return (
    <div className="registro-postgrado-container">
      <BackButton />
      <div className="registro-header">
            <h2 className="registro-title">
                <FaGraduationCap className="title-icon" />
                Registro de Datos de Postgrado
            </h2>
        </div>
        
        {error && (
            <div className="message error">
                <FaExclamationCircle className="icon" />
                {error}
            </div>
        )}
        {success && (
            <div className="message success">
                <FaCheckCircle className="icon" />
                {success}
            </div>
        )}
        
        <form onSubmit={handleSubmit}>
            <div className="search-section">
                <div className="search-container">
                    <div className="search-group">
                        <div className="search-input-wrapper">
                            <FaUser className="search-icon" />
                            <select
                                className="search-input"
                                value={formData.personalId}
                                onChange={handleSelectChange}
                            >
                                <option value="">Seleccione una persona</option>
                                {personasList.map(persona => (
                                    <option key={persona.id} value={persona.id}>
                                        {persona.nombre} {persona.apellido} - {persona.cedula}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="search-input-wrapper">
                            <FaIdCard className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar por cédula..."
                                value={busquedaCedula}
                                onChange={(e) => setBusquedaCedula(e.target.value)}
                            />
                            <button 
                                type="button" 
                                className="search-button"
                                onClick={handleBusquedaCedula}
                                disabled={loading}
                            >
                                {loading ? <FaSpinner className="spin" /> : <FaSearch />}
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {personaEncontrada && (
                <div className="persona-info">
                    <h3>Persona Seleccionada:</h3>
                    <p>
                        <strong>Nombre:</strong> {personaEncontrada.nombre} {personaEncontrada.apellido}
                        <br />
                        <strong>Cédula:</strong> {personaEncontrada.cedula}
                    </p>
                </div>
            )}
        </form>

        {personaEncontrada && (
            <>
                <div className={`form-section ${editMode ? 'editing' : ''}`}>
                    <h3 className="section-title">
                        <FaGraduationCap className="icon" />
                        {editMode ? 'Editar Postgrado' : 'Registrar Nuevo Postgrado'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaUniversity className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="institucion"
                                        value={formData.institucion}
                                        onChange={handleChange}
                                        placeholder="Institución"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaGraduationCap className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        placeholder="Título Obtenido"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Fecha de Inicio (Opcional)
                                </label>
                                <div className="input-wrapper">
                                    <FaCalendarAlt className="input-icon" />
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="fechaInicio"
                                        value={formatVEDateForInput(formData.fechaInicio)}
                                        onChange={(e) => handleChange({ target: { name: 'fechaInicio', value: e.target.value } })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Fecha de Culminación (Obligatorio)
                                </label>
                                <div className="input-wrapper">
                                    <FaCalendarAlt className="input-icon" />
                                    <input
                                        type="date"
                                        className="form-input"
                                        name="fechaFin"
                                        value={formatVEDateForInput(formData.fechaFin)}
                                        onChange={(e) => handleChange({ target: { name: 'fechaFin', value: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaCheckCircle className="input-icon" />
                                    <select
                                        className="form-input"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione el estado</option>
                                        <option value="En Curso">En Curso</option>
                                        <option value="Completado">Completado</option>
                                       
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button
                                type="button"
                                className="clear-button"
                                onClick={handleClear}
                                disabled={loading}
                            >
                                <FaTimes className="icon" />
                                Limpiar
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="icon spin" />
                                        {editMode ? 'Actualizando...' : 'Registrando...'}
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="icon" />
                                        {editMode ? 'Actualizar' : 'Registrar'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {postgradosExistentes.length > 0 && (
                    <div className="postgrados-section">
                        <h3 className="section-title">
                            <FaTable className="icon" />
                            Postgrados Registrados
                        </h3>
                        <div className="table-container">
                            <table className="registros-table">
                                <thead>
                                    <tr>
                                        <th>Institución</th>
                                        <th>Título</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {postgradosExistentes.map((postgrado) => (
                                        <tr key={postgrado.id}>
                                            <td>{postgrado.institucion}</td>
                                            <td>{postgrado.titulo}</td>
                                            <td>{formatVEShortDate(postgrado.fecha_inicio)}</td>
                                            <td>{postgrado.fecha_fin ? formatVEShortDate(postgrado.fecha_fin) : 'En curso'}</td>
                                            <td>{postgrado.estado}</td>
                                            <td className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleEdit(postgrado)}
                                                >
                                                    <FaEdit /> Editar
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(postgrado.id)}
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
                )}
            </>
        )}
    </div>
  );
};

export default RegistroPostgrado;