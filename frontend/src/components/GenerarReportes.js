import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/GenerarReportes.css';
import { 
    FaFileAlt, FaSearch, FaFilePdf, FaUserTie, 
    FaGraduationCap, FaBook, FaAward, FaBriefcase,
    FaClock, FaUserCog, FaSpinner, FaCheckCircle
} from 'react-icons/fa';
import BackButton from './common/BackButton';

const GenerarReportes = () => {
    const [personalList, setPersonalList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPersonal();
    }, []);

    const fetchPersonal = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/personal');
            setPersonalList(response.data);
        } catch (error) {
            console.error('Error al cargar personal:', error);
            setMessage({
                type: 'error',
                text: 'Error al cargar la lista de personal'
            });
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPersonal = personalList.filter(person => 
        person.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateReport = async (type) => {
        if (!selectedPerson) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/reportes/${type}/${selectedPerson.id}`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${type}_${selectedPerson.cedula}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage({
                type: 'success',
                text: 'Reporte generado exitosamente'
            });
        } catch (error) {
            console.error('Error al generar reporte:', error);
            setMessage({
                type: 'error',
                text: 'Error al generar el reporte'
            });
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        { id: 'personal', title: 'Datos Personales', icon: FaUserTie },
        { id: 'asistencia', title: 'Registro de Asistencia', icon: FaClock },
        { id: 'laboral', title: 'Datos Laborales', icon: FaUserCog },
        { id: 'funciones', title: 'Funciones Laborales', icon: FaBriefcase },
        { id: 'postgrado', title: 'Postgrados', icon: FaGraduationCap },
        { id: 'cursos', title: 'Cursos Realizados', icon: FaBook },
        { id: 'reconocimientos', title: 'Reconocimientos', icon: FaAward }
    ];

    return (
        <div className="reportes-container">
            <BackButton />
            <div className="reportes-header">
                <h2 className="reportes-title">
                    <FaFileAlt className="title-icon" />
                    Generación de Reportes
                </h2>
            </div>

            <div className="search-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por cédula o nombre..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaFileAlt />}
                    {message.text}
                </div>
            )}

            <div className="personal-selection">
                <h3>Seleccionar Personal</h3>
                <div className="personal-grid">
                    {filteredPersonal.map(person => (
                        <div 
                            key={person.id}
                            className={`personal-card ${selectedPerson?.id === person.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPerson(person)}
                        >
                            <div className="personal-icon">
                                <FaUserTie />
                            </div>
                            <div className="personal-info">
                                <h4>{person.nombre} {person.apellido}</h4>
                                <p>C.I.: {person.cedula}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedPerson && (
                <div className="reports-section">
                    <h3>Tipos de Reportes Disponibles</h3>
                    <div className="reports-grid">
                        {reportTypes.map(report => (
                            <button
                                key={report.id}
                                className="report-button"
                                onClick={() => generateReport(report.id)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <FaSpinner className="spinner" />
                                ) : (
                                    <report.icon className="report-icon" />
                                )}
                                <span>{report.title}</span>
                                <FaFilePdf className="pdf-icon" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerarReportes; 