import React from 'react';
import './FormField.css';

/**
 * Componente de campo de formulário reutilizável
 * Suporta: text, email, password, tel, number, date, select
 */
const FormField = ({ field, value, onChange, error }) => {
  const { 
    name, 
    label, 
    type = 'text', 
    required = false, 
    placeholder = '', 
    options = [], 
    validation = {},
    hint = ''
  } = field;

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(name, newValue);
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            required={required}
            className={`form-field-input ${error ? 'error' : ''}`}
          >
            <option value="">Selecione...</option>
            {options.map((option, idx) => (
              <option key={idx} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            rows={4}
            className={`form-field-input ${error ? 'error' : ''}`}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            min={validation.min}
            max={validation.max}
            pattern={validation.pattern}
            className={`form-field-input ${error ? 'error' : ''}`}
          />
        );
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      
      {renderInput()}
      
      {hint && !error && (
        <span className="form-field-hint">{hint}</span>
      )}
      
      {error && (
        <span className="form-field-error">{error}</span>
      )}
    </div>
  );
};

export default FormField;
