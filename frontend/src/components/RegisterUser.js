import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RegisterUser.css';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaUserShield, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import BackButton from './common/BackButton';

const RegisterUser = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Función para cargar la lista de usuarios
    const loadUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            console.log("Token para cargar usuarios:", token);

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            console.log("Configuración de la petición:", config);

            const response = await axios.get('http://localhost:5000/api/auth/users', config);

            console.log("Respuesta de usuarios:", response.data);
            setUsers(response.data);
            setError(''); // Limpiar cualquier error previo
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            console.error('Detalles del error:', error.response?.data);
            
            if (error.response?.status === 401) {
                setError('Error de autenticación. Por favor, inicie sesión nuevamente.');
                // Opcional: Redirigir al login
                // window.location.href = '/login';
            } else if (error.response?.status === 403) {
                setError('No tiene permisos para ver la lista de usuarios.');
            } else {
                setError('Error al cargar la lista de usuarios: ' + 
                        (error.response?.data?.message || error.message));
            }
        }
    };

    // Cargar usuarios al montar el componente y cuando se registra uno nuevo
    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setUserData({
            username: user.username,
            email: user.email,
            password: '', // No mostrar la contraseña anterior
            role: user.role
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSuccess('Usuario eliminado exitosamente');
            loadUsers();
        } catch (error) {
            setError('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingUser) {
                await axios.put(
                    `http://localhost:5000/api/auth/users/${editingUser.id}`,
                    userData,
                    config
                );
                setSuccess('Usuario actualizado exitosamente');
            } else {
                await axios.post(
                    'http://localhost:5000/api/auth/register',
                    userData,
                    config
                );
                setSuccess('Usuario registrado exitosamente');
            }

            setUserData({
                username: '',
                email: '',
                password: '',
                role: 'USER'
            });
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            setError(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-user-container">
            <BackButton />
            <div className="register-card">
                <h2 className="register-title">
                    {editingUser ? (
                        <>
                            <FaEdit className="title-icon" />
                            Editar Usuario
                        </>
                    ) : (
                        <>
                            <FaUserPlus className="title-icon" />
                            Registrar Nuevo Usuario
                        </>
                    )}
                </h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="Usuario"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Correo electrónico"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Contraseña"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaUserShield className="input-icon" />
                            <select
                                name="role"
                                value={userData.role}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="USER">Usuario</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : (editingUser ? 'Actualizar Usuario' : 'Registrar Usuario')}
                    </button>

                    {editingUser && (
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => {
                                setEditingUser(null);
                                setUserData({
                                    username: '',
                                    email: '',
                                    password: '',
                                    role: 'USER'
                                });
                            }}
                        >
                            Cancelar Edición
                        </button>
                    )}
                </form>
            </div>

            <div className="users-table-container">
                <h3 className="table-title">
                    <FaUser className="title-icon" />
                    Usuarios Registrados ({users.length})
                </h3>
                <div className="table-responsive">
                    {users.length > 0 ? (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="action-buttons">
                                            <button 
                                                className="edit-button"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <FaEdit /> Editar
                                            </button>
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <FaTrash /> Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-users-message">
                            No hay usuarios registrados
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterUser; 