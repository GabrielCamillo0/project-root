// frontend/src/components/FormInput.js
import React from 'react';

const FormInput = ({ label, type, name, value, onChange, placeholder, error }) => (
  <div className="form-group">
    {label && <label htmlFor={name}>{label}</label>}
    <input
      name={name}
      id={name}
      type={type}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      value={value !== undefined ? value : ""}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <div className="invalid-feedback">{error}</div>}
  </div>
);

export default FormInput;
