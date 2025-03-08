// src/components/HomeForm.js
import React, { useState } from 'react';

function HomeForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [responseMsg, setResponseMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg(data.message);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMsg(data.error || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMsg('Error de conexión');
    }
  };

  return (
    <div>
      <h2>Contacto</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Mensaje</label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Enviar</button>
      </form>
      {responseMsg && (
        <div className="alert alert-info mt-3">
          {responseMsg}
        </div>
      )}
    </div>
  );
}

export default HomeForm;
