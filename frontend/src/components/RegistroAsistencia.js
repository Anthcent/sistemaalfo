import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Asistencia.css';

function RegistroAsistencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
    observacion: ''
  });
  const [personalData, setPersonalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPersonalData();
  }, [id]);

  const fetchPersonalData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/personal/${id}`);
      setPersonalData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del personal:', error);
      setMessage({ text: 'Error al cargar datos del personal', type: 'error' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      personal_id: id,
      asistio: true
    };

    try {
      const response = await axios.post('http://localhost:5000/api/asistencia', payload);
      setMessage({ text: '✅ Asistencia registrada correctamente', type: 'success' });
      
      setTimeout(() => {
        navigate('/listado-personal');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: '❌ ' + (error.response?.data?.error || 'Error al registrar asistencia'), 
        type: 'error' 
      });
      setLoading(false);
    }
  };

  if (loading && !personalData) {
    return <div className="loading-spinner">Cargando...</div>;
  }

  return (
    <div className="registro-asistencia-container">
      <div className="registro-card">
        <h2 className="registro-title">Registro de Asistencia Individual</h2>
        
        {personalData && (
          <div className="personal-info">
            <h3>{personalData.nombre} {personalData.apellido}</h3>
            <p className="cedula">Cédula: {personalData.cedula}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registro-form">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              name="fecha"
              className="form-input"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora</label>
            <input
              type="time"
              name="hora"
              className="form-input"
              value={formData.hora}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Observación</label>
            <textarea
              name="observacion"
              className="form-input textarea"
              value={formData.observacion}
              onChange={handleChange}
              placeholder="Agregar observación (opcional)"
              rows="3"
            />
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistroAsistencia;