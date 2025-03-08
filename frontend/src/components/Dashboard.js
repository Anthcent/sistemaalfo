import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Dashboard.css';
import { 
    FaHome,
    FaUserPlus,
    FaList,
    FaSearch,
    FaClock,
    FaGraduationCap,
    FaBook,
    FaAward,
    FaUserTie
} from 'react-icons/fa';

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const quickAccess = [
        {
            title: 'Listado de Personal',
            description: 'Ver lista completa del personal',
            icon: <FaList />,
            path: '/listado-personal',
            color: '#2196F3'
        },
        {
            title: 'Registrar Personal',
            description: 'Agregar nuevo personal',
            icon: <FaUserPlus />,
            path: '/registro-personal',
            color: '#4CAF50'
        },
        {
            title: 'Buscar Personal',
            description: 'Búsqueda por cédula o nombre',
            icon: <FaSearch />,
            path: '/buscar-personal',
            color: '#FF9800'
        },
        {
            title: 'Asistencia',
            description: 'Control de asistencia',
            icon: <FaClock />,
            path: '/ver-asistencia',
            color: '#E91E63'
        },
        {
            title: 'Postgrados',
            description: 'Gestión de postgrados',
            icon: <FaGraduationCap />,
            path: '/registro-postgrado',
            color: '#9C27B0'
        },
        {
            title: 'Cursos',
            description: 'Registro de cursos',
            icon: <FaBook />,
            path: '/registro-cursos',
            color: '#00BCD4'
        },
        {
            title: 'Reconocimientos',
            description: 'Registro de reconocimientos',
            icon: <FaAward />,
            path: '/registro-reconocimientos',
            color: '#607D8B'
        }
    ];

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/buscar-personal?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-card">
                <div className="welcome-icon">
                    <FaHome />
                </div>
                <div className="welcome-content">
                    <h1>¡Bienvenido al Sistema de Personal!</h1>
                    <p className="user-welcome">
                        {user.username ? (
                            <>Hola, <span className="username">{user.username}</span></>
                        ) : (
                            'Bienvenido'
                        )}
                    </p>
                    <p className="welcome-message">
                        Accede a las diferentes funciones del sistema usando el menú de navegación
                    </p>
                </div>
            </div>

            <div className="quick-search-section">
                <form onSubmit={handleQuickSearch} className="quick-search-form">
                    <div className="quick-search-wrapper">
                        <FaSearch className="quick-search-icon" />
                        <input
                            type="text"
                            className="quick-search-input"
                            placeholder="Buscar personal por cédula o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="quick-search-button">
                        <FaUserTie className="button-icon" />
                        <span>Buscar Personal</span>
                    </button>
                </form>
            </div>

            <div className="quick-access-section">
               
                <div className="quick-access-grid">
                    {quickAccess.map((item, index) => (
                        <div 
                            key={index}
                            className="quick-access-card"
                            onClick={() => navigate(item.path)}
                            style={{ '--card-color': item.color }}
                        >
                            <div className="card-icon">
                                {item.icon}
                            </div>
                            <div className="card-content">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 