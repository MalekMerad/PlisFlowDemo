import React from 'react';
import './../../../styles/componentsStyles/TextArea.css';

const TextArea = ({ label, name, value, onChange, placeholder, required = false }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="text-area"
      />
    </div>
  );
};

export default TextArea;
