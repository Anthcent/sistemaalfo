import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RegistroReconocimientos.css';
import { 
    FaSearch, 
    FaAward, 
    FaBuilding, 
    FaCalendarAlt, 
    FaClock, 
    FaPlus, 
    FaTrash, 
    FaCheck, 
    FaTimes,
    FaExclamationCircle,
    FaUser,
    FaIdCard,
    FaTable,
    FaEdit
} from 'react-icons/fa';
import BackButton from './common/BackButton';
import { formatVEDateForInput } from '../utils/dateUtils';

const RegistroReconocimientos = () => {
    const [personasList, setPersonasList] = useState([]);
    const [busquedaCedula, setBusquedaCedula] = useState('');
    const [personaEncontrada, setPersonaEncontrada] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentRecognition, setCurrentRecognition] = useState({
        nombre_reconocimiento: '',
        institucion: '',
        fecha_obtencion: '',
        descripcion: '',
        reconocido: false
    });
    const [recognitions, setRecognitions] = useState([]);
    const [reconocimientosExistentes, setReconocimientosExistentes] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Configurar la URL base para axios
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

    const handleCurrentRecognitionChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentRecognition(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(null);
    };

    const handleSelectChange = async (e) => {
        const personal_id = e.target.value;
        setSelectedPersonId(personal_id);
        setPersonaEncontrada(null);
        setError(null);
        setSuccess(null);

        if (personal_id) {
            const persona = personasList.find(p => p.id === parseInt(personal_id));
            setPersonaEncontrada(persona);
            await cargarReconocimientosPersona(personal_id);
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
            await cargarReconocimientosPersona(persona.id);
            setError(null);
        } catch (error) {
            console.error('Error al buscar persona:', error);
            setPersonaEncontrada(null);
            setReconocimientosExistentes([]);
            setError('No se encontró una persona con esa cédula');
        } finally {
            setLoading(false);
        }
    };

    const cargarReconocimientosPersona = async (personalId) => {
        try {
            const response = await axios.get(`/reconocimientos/personal/${personalId}`);
            console.log('Reconocimientos cargados:', response.data);
            setReconocimientosExistentes(response.data);
        } catch (error) {
            console.error('Error al cargar reconocimientos:', error);
            setReconocimientosExistentes([]);
        }
    };

    const addRecognition = () => {
        if (
            !currentRecognition.nombre_reconocimiento || 
            !currentRecognition.institucion || 
            !currentRecognition.fecha_obtencion
        ) {
            setError('Complete los campos obligatorios del reconocimiento actual');
            return;
        }
        setRecognitions(prev => [...prev, { ...currentRecognition }]);
        setCurrentRecognition({
            nombre_reconocimiento: '',
            institucion: '',
            fecha_obtencion: '',
            descripcion: '',
            reconocido: false
        });
        setError(null);
    };

    const removeRecognition = (index) => {
        setRecognitions(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (reconocimiento) => {
        setCurrentRecognition({
            nombre_reconocimiento: reconocimiento.nombre_reconocimiento,
            institucion: reconocimiento.institucion,
            fecha_obtencion: reconocimiento.fecha_obtencion,
            descripcion: reconocimiento.descripcion || '',
            reconocido: reconocimiento.reconocido
        });
        setEditMode(true);
        setEditingId(reconocimiento.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este reconocimiento?')) {
            try {
                await axios.delete(`/reconocimientos/${id}`);
                await cargarReconocimientosPersona(selectedPersonId);
                setSuccess('Reconocimiento eliminado exitosamente');
            } catch (error) {
                setError('Error al eliminar el reconocimiento');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPersonId) {
            setError('Debe seleccionar o buscar una persona');
            return;
        }

        setLoading(true);
        try {
            if (editMode) {
                await axios.put(`/reconocimientos/${editingId}`, {
                    ...currentRecognition,
                    personal_id: selectedPersonId
                });
                setSuccess('Reconocimiento actualizado exitosamente');
            } else {
                let allRecognitions = [...recognitions];

                // Agregar el reconocimiento actual si tiene datos
                if (currentRecognition.nombre_reconocimiento && 
                    currentRecognition.institucion && 
                    currentRecognition.fecha_obtencion) {
                    allRecognitions.push(currentRecognition);
                }

                if (allRecognitions.length === 0) {
                    setError('Debe agregar al menos un reconocimiento');
                    setLoading(false);
                    return;
                }

                // Enviar todos los reconocimientos
                const promises = allRecognitions.map(recognition => 
                    axios.post('/registrar-reconocimiento', {
                        ...recognition,
                        personal_id: selectedPersonId
                    })
                );

                await Promise.all(promises);
                setSuccess('Reconocimientos registrados exitosamente');
            }

            // Limpiar formulario y recargar datos
            setCurrentRecognition({
                nombre_reconocimiento: '',
                institucion: '',
                fecha_obtencion: '',
                descripcion: '',
                reconocido: false
            });
            setRecognitions([]); // Limpiar la lista de reconocimientos
            setEditMode(false);
            setEditingId(null);
            await cargarReconocimientosPersona(selectedPersonId);
        } catch (error) {
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-reconocimientos-container">
            <BackButton />
            <div className="registro-header">
                <h2 className="registro-title">
                    <FaAward className="title-icon" />
                    Registro de Reconocimientos Obtenidos
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
                    <FaCheck className="icon" />
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="search-section">
                    <div className="search-container">
                        <div className="search-group">
                            <div className="search-input-wrapper select">
                                <FaUser className="search-icon" />
                                <select
                                    className="search-input"
                                    value={selectedPersonId}
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

                            <div className="search-input-wrapper cedula">
                                <FaIdCard className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar por cédula"
                                    value={busquedaCedula}
                                    onChange={handleBusquedaCedulaChange}
                                />
                                <button 
                                    type="button" 
                                    className="search-button"
                                    onClick={handleBusquedaCedula}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        <FaSearch className="icon" />
                                    )}
                                    Buscar
                                </button>
                            </div>
                        </div>

                        {personaEncontrada && (
                            <div className="persona-encontrada">
                                <FaUser className="icon" />
                                <div className="persona-info">
                                    <h4>{personaEncontrada.nombre} {personaEncontrada.apellido}</h4>
                                    <p>Cédula: {personaEncontrada.cedula}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="recognitions-section">
                    <div className="recognitions-header">
                        <h3>
                            <FaAward className="icon" />
                            Reconocimientos
                        </h3>
                        <span className="recognitions-counter">
                            {recognitions.length} reconocimiento(s)
                        </span>
                    </div>

                    <div className="recognition-form">
                        <div className="form-row">
                            <div className="form-group">
                            <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Como aparece en el Certificado
                                </label>
                                <div className="input-wrapper">
                                    <FaAward className="input-icon" />
                                    <input
                                        type="text"
                                        name="nombre_reconocimiento"
                                        className="form-input"
                                        value={currentRecognition.nombre_reconocimiento}
                                        onChange={handleCurrentRecognitionChange}
                                        placeholder="Nombre del Reconocimiento"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                           
                                <div className="input-wrapper">
                                    <FaBuilding className="input-icon" />
                                    <input
                                        type="text"
                                        name="institucion"
                                        className="form-input"
                                        value={currentRecognition.institucion}
                                        onChange={handleCurrentRecognitionChange}
                                        placeholder="Institución"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                            <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Fecha de Culminación (Obligatorio)
                                </label>
                                <div className="input-wrapper">
                                    <FaCalendarAlt className="input-icon" />
                                    <input
                                        type="date"
                                        name="fecha_obtencion"
                                        className="form-input"
                                        value={formatVEDateForInput(currentRecognition.fecha_obtencion)}
                                        onChange={(e) => handleCurrentRecognitionChange(e)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaClock className="input-icon" />
                                    <input
                                        type="text"
                                        name="descripcion"
                                        className="form-input"
                                        value={currentRecognition.descripcion}
                                        onChange={handleCurrentRecognitionChange}
                                        placeholder="Descripción (opcional)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                name="reconocido"
                                checked={currentRecognition.reconocido}
                                onChange={handleCurrentRecognitionChange}
                                id="reconocido"
                            />
                            <label htmlFor="reconocido">
                                <FaCheck className="icon" /> Reconocimiento Oficial
                            </label>
                        </div>

                        <button 
                            type="button" 
                            className="add-recognition-button"
                            onClick={addRecognition}
                        >
                            <FaPlus className="icon" /> Agregar Reconocimiento
                        </button>
                    </div>

                    <div className="recognition-list">
                        {recognitions.map((rec, index) => (
                            <div key={index} className="recognition-item">
                                <div className="recognition-header">
                                    <span className="recognition-number">
                                        <FaAward className="icon" />
                                        Reconocimiento #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        className="remove-recognition"
                                        onClick={() => removeRecognition(index)}
                                    >
                                        <FaTrash className="icon" /> Eliminar
                                    </button>
                                </div>
                                <div className="recognition-details">
                                    <p><FaAward className="icon" /> {rec.nombre_reconocimiento}</p>
                                    <p><FaBuilding className="icon" /> {rec.institucion}</p>
                                    <p><FaCalendarAlt className="icon" /> {formatVEDateForInput(rec.fecha_obtencion)}</p>
                                    {rec.descripcion && <p><FaClock className="icon" /> {rec.descripcion}</p>}
                                    <p className={`reconocido-status ${rec.reconocido ? 'oficial' : 'no-oficial'}`}>
                                        {rec.reconocido ? (
                                            <><FaCheck className="icon" /> Oficial</>
                                        ) : (
                                            <><FaTimes className="icon" /> No Oficial</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="loading-spinner"></div>
                                {editMode ? 'Actualizando...' : 'Guardando...'}
                            </>
                        ) : (
                            <>
                                <FaCheck className="icon" />
                                {editMode ? 'Actualizar Reconocimiento' : 'Guardar Reconocimiento'}
                            </>
                        )}
                    </button>
                    {editMode && (
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => {
                                setEditMode(false);
                                setEditingId(null);
                                setCurrentRecognition({
                                    nombre_reconocimiento: '',
                                    institucion: '',
                                    fecha_obtencion: '',
                                    descripcion: '',
                                    reconocido: false
                                });
                            }}
                        >
                            <FaTimes className="icon" />
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </form>

            {reconocimientosExistentes && reconocimientosExistentes.length > 0 && (
                <div className="reconocimientos-section">
                    <h3 className="section-title">
                        <FaTable className="icon" />
                        Reconocimientos Registrados
                    </h3>
                    <div className="table-container">
                        <table className="registros-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Reconocimiento</th>
                                    <th>Institución</th>
                                    <th>Fecha Obtención</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconocimientosExistentes.map((reconocimiento) => (
                                    <tr key={reconocimiento.id}>
                                        <td>{reconocimiento.nombre_reconocimiento}</td>
                                        <td>{reconocimiento.institucion}</td>
                                        <td>{formatVEDateForInput(reconocimiento.fecha_obtencion)}</td>
                                        <td>{reconocimiento.descripcion || '-'}</td>
                                        <td>{reconocimiento.reconocido ? 'Oficial' : 'No Oficial'}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEdit(reconocimiento)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(reconocimiento.id)}
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
        </div>
    );
};

export default RegistroReconocimientos;
