import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './css/Navigation.css';
import MainNavbar from './components/MainNavbar';

// Importar componentes
import RegistroPersonal from './components/RegistroPersonal';
import ListadoPersonal from './components/ListadoPersonal';
import RegistroLaboral from './components/RegistroLaboral';
import DetallePersonal from './components/DetallePersonal';
import RegistroFuncionesLaborales from './components/RegistroFuncionesLaborales';
import BusquedaPersonal from './components/BusquedaPersonal';
import Asistencia from './components/Asistencia';
import VerAsistencia from './components/VerAsistencia';
import RegistroPostgrado from './components/RegistroPostgrado';
import RegistroCursos from './components/RegistroCursos';
import RegistroReconocimientos from './components/RegistroReconocimientos';
import Login from './components/Login';
import RegisterUser from './components/RegisterUser';
import Dashboard from './components/Dashboard';
import GenerarReportes from './components/GenerarReportes';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/verify-token', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Componente para rutas protegidas
  const ProtectedRoute = ({ element, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAllowed = allowedRoles.includes(user.role);

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!isAllowed) return <Navigate to="/" />;
    return element;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated ? (
        <div className="app-container">
          <MainNavbar 
            userRole={userRole}
            onLogout={handleLogout}
          />
          
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/registro-personal" 
                element={<ProtectedRoute 
                  element={<RegistroPersonal />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/listado-personal" 
                element={<ProtectedRoute 
                  element={<ListadoPersonal />} 
                  allowedRoles={['USER', 'ADMIN']} 
                />} 
              />
              <Route 
                path="/registro-laboral/:id" 
                element={<ProtectedRoute 
                  element={<RegistroLaboral />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/registro-funciones-laborales/:id" 
                element={<ProtectedRoute 
                  element={<RegistroFuncionesLaborales />} 
                  allowedRoles={['USER', 'ADMIN']} 
                />} 
              />
              <Route 
                path="/detalle-personal/:id" 
                element={<ProtectedRoute 
                  element={<DetallePersonal />} 
                  allowedRoles={['USER', 'ADMIN']} 
                />} 
              />
              <Route 
                path="/buscar-personal" 
                element={<ProtectedRoute 
                  element={<BusquedaPersonal />} 
                  allowedRoles={['USER', 'ADMIN']} 
                />} 
              />
              <Route 
                path="/ver-asistencia" 
                element={<ProtectedRoute 
                  element={<VerAsistencia />} 
                  allowedRoles={['USER', 'ADMIN']} 
                />} 
              />
              <Route 
                path="/asistencia" 
                element={<ProtectedRoute 
                  element={<Asistencia />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/registro-postgrado" 
                element={<ProtectedRoute 
                  element={<RegistroPostgrado />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/registro-cursos" 
                element={<ProtectedRoute 
                  element={<RegistroCursos />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/registro-reconocimientos" 
                element={<ProtectedRoute 
                  element={<RegistroReconocimientos />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/register-user" 
                element={<ProtectedRoute 
                  element={<RegisterUser />} 
                  allowedRoles={['ADMIN']} 
                />} 
              />
              <Route 
                path="/reportes" 
                element={
                  <ProtectedRoute 
                    element={<GenerarReportes />} 
                    allowedRoles={['USER', 'ADMIN']} 
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route 
            path="/login" 
            element={
              <Login 
                setIsAuthenticated={setIsAuthenticated} 
                setUserRole={setUserRole} 
              />
            } 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
