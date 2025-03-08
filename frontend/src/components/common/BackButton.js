import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../../css/BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      className="back-button" 
      onClick={() => navigate(-1)}
      title="Regresar"
    >
      <FaArrowLeft className="back-icon" />
      <span>Regresar</span>
    </button>
  );
};

export default BackButton; 