import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css';
import { 
    FaUser, 
    FaLock, 
    FaSignInAlt, 
    FaExclamationCircle, 
    FaEye, 
    FaEyeSlash,
    FaClock,
    FaCalendarAlt
} from 'react-icons/fa';
import { formatVEDate, formatVETime } from '../utils/dateUtils';

const Login = ({ setIsAuthenticated, setUserRole }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/login',
                credentials
            );

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setIsAuthenticated(true);
                setUserRole(response.data.user.role);
                
                // Añadir clase para animación de éxito
                document.querySelector('.login-card').classList.add('success');
                
                // Esperar a que termine la animación antes de navegar
                setTimeout(() => {
                    navigate('/');
                }, 800);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Error al iniciar sesión. Verifique sus credenciales.'
            );
            // Añadir clase para animación de error
            const loginCard = document.querySelector('.login-card');
            loginCard.classList.add('error-shake');
            setTimeout(() => loginCard.classList.remove('error-shake'), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="datetime-card">
                <div className="date-section">
                    <FaCalendarAlt className="datetime-icon" />
                    <span>{formatVEDate(currentTime)}</span>
                </div>
                <div className="time-section">
                    <FaClock className="datetime-icon" />
                    <span>{formatVETime(currentTime)}</span>
                </div>
            </div>
            <div className="login-card">
                <div className="login-header">
                    <FaSignInAlt className="title-icon" />
                    <h2 className="login-title">Bienvenido</h2>
                    <p className="login-subtitle">Ingrese sus credenciales para continuar</p>
                </div>

                {error && (
                    <div className="error-message">
                        <FaExclamationCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Usuario"
                                required
                                className="form-input"
                            />
                            <span className="input-focus"></span>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Contraseña"
                                required
                                className="form-input"
                            />
                            <button 
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            <span className="input-focus"></span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        <span className="button-text">
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </span>
                        <span className="button-loader"></span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login; 