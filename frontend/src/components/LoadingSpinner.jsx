import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  return (
    <div className={`spinner-container ${size}`}>
      <div className="spinner"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
