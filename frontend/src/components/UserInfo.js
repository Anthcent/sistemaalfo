import React from 'react';
import { FaUser } from 'react-icons/fa';
import '../css/UserInfo.css';

const UserInfo = ({ onLogout }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="user-info">
            <div className="user-details">
                <FaUser className="user-icon" />
                <span className="username">{user.username}</span>
                <span className="role">({user.role})</span>
            </div>
            <button onClick={onLogout} className="logout-button">
                Cerrar Sesión
            </button>
        </div>
    );
};

export default UserInfo; 