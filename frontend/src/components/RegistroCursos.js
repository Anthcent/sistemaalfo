import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RegistroCursos.css';
import { 
    FaSearch, 
    FaUserGraduate, 
    FaBuilding, 
    FaCalendarAlt, 
    FaClock, 
    FaCertificate, 
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
import { 
    formatVEDate, 
    formatVETime, 
    formatVEDateTime, 
    formatVEShortDate, 
    formatVEDateForInput 
} from '../utils/dateUtils';

const RegistroCursos = () => {
    const [personasList, setPersonasList] = useState([]);
    const [busquedaCedula, setBusquedaCedula] = useState('');
    const [personaEncontrada, setPersonaEncontrada] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentCertificate, setCurrentCertificate] = useState({
        nombre_curso: '',
        institucion: '',
        fecha_inicio: '',
        fecha_fin: '',
        duracion_horas: '',
        tipo_curso: '',
        certificado: false
    });
    const [certificates, setCertificates] = useState([]);
    const [cursosExistentes, setCursosExistentes] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Configure axios base URL
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

    const handleCurrentCertificateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCertificate(prev => ({
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
            await cargarCursosPersona(personal_id);
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
            await cargarCursosPersona(persona.id);
            setError(null);
        } catch (error) {
            console.error('Error al buscar persona:', error);
            setPersonaEncontrada(null);
            setCursosExistentes([]);
            setError('No se encontró una persona con esa cédula');
        } finally {
            setLoading(false);
        }
    };

    const cargarCursosPersona = async (personalId) => {
        try {
            const response = await axios.get(`/cursos/personal/${personalId}`);
            console.log('Cursos cargados:', response.data); // Para debug
            setCursosExistentes(response.data);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            setCursosExistentes([]);
        }
    };

    const addCertificate = () => {
        if (!currentCertificate.nombre_curso || !currentCertificate.institucion || !currentCertificate.fecha_inicio) {
            setError('Complete los campos obligatorios del certificado actual');
            return;
        }
        setCertificates(prev => [...prev, { ...currentCertificate }]);
        setCurrentCertificate({
            nombre_curso: '',
            institucion: '',
            fecha_inicio: '',
            fecha_fin: '',
            duracion_horas: '',
            tipo_curso: '',
            certificado: false
        });
        setError(null);
    };

    const removeCertificate = (index) => {
        setCertificates(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (curso) => {
        setCurrentCertificate({
            nombre_curso: curso.nombre_curso,
            institucion: curso.institucion,
            fecha_inicio: curso.fecha_inicio,
            fecha_fin: curso.fecha_fin || '',
            duracion_horas: curso.duracion_horas,
            tipo_curso: curso.tipo_curso,
            certificado: curso.certificado
        });
        setEditMode(true);
        setEditingId(curso.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este curso?')) {
            try {
                await axios.delete(`/cursos/${id}`);
                await cargarCursosPersona(selectedPersonId);
                setSuccess('Curso eliminado exitosamente');
            } catch (error) {
                setError('Error al eliminar el curso');
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
                await axios.put(`/cursos/${editingId}`, {
                    ...currentCertificate,
                    personal_id: selectedPersonId
                });
                setSuccess('Curso actualizado exitosamente');
            } else {
                let allCertificates = [...certificates];

                // Agregar el certificado actual si tiene datos
                if (currentCertificate.nombre_curso && 
                    currentCertificate.institucion && 
                    currentCertificate.fecha_inicio) {
                    allCertificates.push(currentCertificate);
                }

                if (allCertificates.length === 0) {
                    setError('Debe agregar al menos un curso');
                    setLoading(false);
                    return;
                }

                // Enviar todos los certificados
                const promises = allCertificates.map(certificate => 
                    axios.post('/registrar-curso', {
                        ...certificate,
                        personal_id: selectedPersonId
                    })
                );

                await Promise.all(promises);
                setSuccess('Cursos registrados exitosamente');
            }

            // Limpiar formulario y recargar datos
            setCurrentCertificate({
                nombre_curso: '',
                institucion: '',
                fecha_inicio: '',
                fecha_fin: '',
                duracion_horas: '',
                tipo_curso: '',
                certificado: false
            });
            setCertificates([]); // Limpiar la lista de certificados
            setEditMode(false);
            setEditingId(null);
            await cargarCursosPersona(selectedPersonId);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-cursos-container">
            <BackButton />
            <div className="registro-header">
                <h2 className="registro-title">
                    <FaUserGraduate className="title-icon" />
                    Registro de Cursos Realizados
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
                            <div className="search-input-wrapper">
                                <FaUser className="search-icon" />
                                <select
                                    className="search-input"
                                    value={selectedPersonId}
                                    onChange={handleSelectChange}
                                    required
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
                                    value={busquedaCedula}
                                    onChange={handleBusquedaCedulaChange}
                                    placeholder="Buscar por Cédula"
                                />
                                <button 
                                    type="button" 
                                    className="search-button"
                                    onClick={handleBusquedaCedula}
                                >
                                    <FaSearch className="icon" /> Buscar
                                </button>
                            </div>
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

                <div className="certificates-section">
                    <div className="certificates-header">
                        <h3>
                            <FaCertificate className="icon" />
                            Certificados
                        </h3>
                        <span className="certificates-counter">
                            {certificates.length} certificado(s)
                        </span>
                    </div>

                    <div className="certificate-form">
                        <div className="form-row">
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaUserGraduate className="input-icon" />
                                    <input
                                        type="text"
                                        name="nombre_curso"
                                        className="form-input"
                                        value={currentCertificate.nombre_curso}
                                        onChange={handleCurrentCertificateChange}
                                        placeholder="Nombre del Curso"
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
                                        value={currentCertificate.institucion}
                                        onChange={handleCurrentCertificateChange}
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
                                    Fecha de Inicio (Opcional)
                                </label>
                                <div className="input-wrapper">
                                    <FaCalendarAlt className="input-icon" />
                                    <input
                                        type="date"
                                        name="fecha_inicio"
                                        className="form-input"
                                        value={formatVEDateForInput(currentCertificate.fecha_inicio)}
                                        onChange={(e) => handleCurrentCertificateChange({ target: { name: 'fecha_inicio', value: e.target.value } })}
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
                                        name="fecha_fin"
                                        className="form-input"
                                        value={formatVEDateForInput(currentCertificate.fecha_fin)}
                                        onChange={(e) => handleCurrentCertificateChange({ target: { name: 'fecha_fin', value: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaClock className="input-icon" />
                                    <input
                                        type="number"
                                        name="duracion_horas"
                                        className="form-input"
                                        value={currentCertificate.duracion_horas}
                                        onChange={handleCurrentCertificateChange}
                                        placeholder="Duración (horas)"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-wrapper">
                                    <FaCertificate className="input-icon" />
                                    <input
                                        type="text"
                                        name="tipo_curso"
                                        className="form-input"
                                        value={currentCertificate.tipo_curso}
                                        onChange={handleCurrentCertificateChange}
                                        placeholder="Tipo de Curso"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                name="certificado"
                                checked={currentCertificate.certificado}
                                onChange={handleCurrentCertificateChange}
                                id="certificado"
                            />
                            <label htmlFor="certificado">
                                <FaCheck className="icon" /> Certificado Recibido
                            </label>
                        </div>

                        <button 
                            type="button" 
                            className="add-certificate-button"
                            onClick={addCertificate}
                        >
                            <FaPlus className="icon" /> Agregar Curso Adicional
                        </button>
                    </div>

                    <div className="certificate-list">
                        {certificates.map((cert, index) => (
                            <div key={index} className="certificate-item">
                                <div className="certificate-header">
                                    <span className="certificate-number">
                                        <FaCertificate className="icon" />
                                        Certificado #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        className="remove-certificate"
                                        onClick={() => removeCertificate(index)}
                                    >
                                        <FaTrash className="icon" /> Eliminar
                                    </button>
                                </div>
                                <div className="certificate-details">
                                    <p><FaUserGraduate className="icon" /> {cert.nombre_curso}</p>
                                    <p><FaBuilding className="icon" /> {cert.institucion}</p>
                                    <p><FaCalendarAlt className="icon" /> {formatVEShortDate(cert.fecha_inicio)} - {cert.fecha_fin ? formatVEShortDate(cert.fecha_fin) : 'En curso'}</p>
                                    <p><FaClock className="icon" /> {cert.duracion_horas || 'No especificado'} horas</p>
                                    <p><FaCertificate className="icon" /> {cert.tipo_curso || 'No especificado'}</p>
                                    <p className={`certificado-status ${cert.certificado ? 'recibido' : 'pendiente'}`}>
                                        {cert.certificado ? (
                                            <><FaCheck className="icon" /> Certificado Recibido</>
                                        ) : (
                                            <><FaTimes className="icon" /> Certificado Pendiente</>
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
                                {editMode ? 'Actualizar Curso' : 'Guardar Curso'}
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
                                setCurrentCertificate({
                                    nombre_curso: '',
                                    institucion: '',
                                    fecha_inicio: '',
                                    fecha_fin: '',
                                    duracion_horas: '',
                                    tipo_curso: '',
                                    certificado: false
                                });
                            }}
                        >
                            <FaTimes className="icon" />
                            Cancelar Edición
                        </button>
                    )}
                </div>
            </form>

            {cursosExistentes && cursosExistentes.length > 0 && (
                <div className="cursos-section">
                    <h3 className="section-title">
                        <FaTable className="icon" />
                        Cursos Registrados
                    </h3>
                    <div className="table-container">
                        <table className="registros-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Curso</th>
                                    <th>Institución</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Duración (horas)</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursosExistentes.map((curso) => (
                                    <tr key={curso.id}>
                                        <td>{curso.nombre_curso}</td>
                                        <td>{curso.institucion}</td>
                                        <td>{formatVEShortDate(curso.fecha_inicio)}</td>
                                        <td>{curso.fecha_fin ? formatVEShortDate(curso.fecha_fin) : 'En curso'}</td>
                                        <td>{curso.duracion_horas || '-'}</td>
                                        <td>{curso.tipo_curso || '-'}</td>
                                        <td>{curso.certificado ? 'Certificado' : 'Pendiente'}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEdit(curso)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(curso.id)}
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

export default RegistroCursos;