import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/MainNavbar.css';
import { 
  FaHome, FaUserCog, FaClock, FaGraduationCap, 
  FaUserShield, FaChevronDown, FaBars, FaTimes,
  FaUser, FaPowerOff, FaUserPlus, FaList, FaSearch,
  FaUserGraduate, FaBook, FaAward, FaChild, FaFileAlt
} from 'react-icons/fa';

const MainNavbar = ({ userRole, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      title: 'Inicio',
      icon: <FaHome />,
      path: '/',
      roles: ['USER', 'ADMIN']
    },
    {
      title: 'Personal',
      icon: <FaUserCog />,
      roles: ['USER', 'ADMIN'],
      submenu: [
        {
          title: 'Registrar Personal',
          path: '/registro-personal',
          icon: <FaUserPlus />,
          roles: ['ADMIN']
        },
        {
          title: 'Listado Personal',
          path: '/listado-personal',
          icon: <FaList />,
          roles: ['USER', 'ADMIN']
        },
        {
          title: 'Buscar Personal',
          path: '/buscar-personal',
          icon: <FaSearch />,
          roles: ['USER', 'ADMIN']
        }
      ]
    },
    {
      title: 'Asistencia',
      icon: <FaClock />,
      roles: ['USER', 'ADMIN'],
      submenu: [
        {
          title: 'Registrar Asistencia',
          path: '/asistencia',
          icon: <FaClock />,
          roles: ['ADMIN']
        },
        {
          title: 'Ver Asistencia',
          path: '/ver-asistencia',
          icon: <FaList />,
          roles: ['USER', 'ADMIN']
        }
      ]
    },
    {
      title: 'Formación',
      icon: <FaGraduationCap />,
      roles: ['ADMIN'],
      submenu: [
        {
          title: 'Postgrados',
          path: '/registro-postgrado',
          icon: <FaUserGraduate />,
          roles: ['ADMIN']
        },
        {
          title: 'Cursos',
          path: '/registro-cursos',
          icon: <FaBook />,
          roles: ['ADMIN']
        },
        {
          title: 'Reconocimientos',
          path: '/registro-reconocimientos',
          icon: <FaAward />,
          roles: ['ADMIN']
        }
      ]
    },
    {
      title: 'Sistema',
      icon: <FaUserShield />,
      roles: ['ADMIN'],
      submenu: [
        {
          title: 'Usuarios',
          path: '/register-user',
          icon: <FaUserShield />,
          roles: ['ADMIN']
        }
      ]
    },
    {
      title: 'Reportes',
      icon: <FaFileAlt />,
      path: '/reportes',
      roles: ['USER', 'ADMIN']
    }
  ];

  const handleDropdown = (index, e) => {
    e?.preventDefault();
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  const handleMenuClick = (path) => {
    if (location.pathname === path) {
      return false; // Prevenir navegación si ya estamos en la ruta
    }
    setIsOpen(false);
    setActiveDropdown(null);
    return true;
  };

  // Obtener datos del usuario
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={(e) => {
          if (location.pathname === '/') e.preventDefault();
        }}>
          <div className="logo-container">
            <FaChild className="navbar-icon" />
          </div>
          <span className="brand-text">FUNDACIÓN DEL NIÑO</span>
        </Link>

        <button 
          className={`mobile-toggle ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {menuItems
            .filter(item => item.roles.includes(userRole))
            .map((item, index) => (
              <div 
                key={index}
                className={`menu-item ${item.submenu ? 'has-submenu' : ''}`}
                onMouseEnter={() => !isOpen && handleDropdown(index)}
                onMouseLeave={() => !isOpen && handleDropdown(null)}
              >
                {item.submenu ? (
                  <>
                    <button
                      className={`menu-button ${activeDropdown === index ? 'active' : ''}`}
                      onClick={(e) => handleDropdown(index, e)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      <FaChevronDown className={`dropdown-arrow ${activeDropdown === index ? 'active' : ''}`} />
                    </button>
                    <div className={`submenu ${activeDropdown === index ? 'active' : ''}`}>
                      {item.submenu
                        .filter(subitem => subitem.roles.includes(userRole))
                        .map((subitem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subitem.path}
                            className={`submenu-item ${location.pathname === subitem.path ? 'active' : ''}`}
                            onClick={() => handleMenuClick(subitem.path)}
                          >
                            {subitem.icon}
                            <span>{subitem.title}</span>
                          </Link>
                        ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.path)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          
          <div className="navbar-user">
            <div className="user-profile">
              <div className="user-info">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  <span className="user-badge" data-role={user.role}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
              </div>
              <button 
                className="logout-btn" 
                onClick={onLogout}
                title="Cerrar Sesión"
              >
                <span className="logout-text">Salir</span>
                <FaPowerOff className="logout-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar; 