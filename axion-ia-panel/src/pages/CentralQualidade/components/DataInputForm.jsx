import React, { useState, useEffect } from 'react';
import FormField from './FormField';
import './DataInputForm.css';

/**
 * Componente de formulário dinâmico para entrada de dados de teste
 * Gera campos automaticamente baseado no dataSchema do script
 */
const DataInputForm = ({ 
  script, 
  onSubmit, 
  onCancel,
  templates = [],
  onSaveTemplate,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Inicializa formData com dados iniciais ou valores padrão
  useEffect(() => {
    if (script?.dataSchema?.fields) {
      const defaultData = {};
      script.dataSchema.fields.forEach(field => {
        defaultData[field.name] = (initialData && initialData[field.name] !== undefined)
          ? initialData[field.name]
          : (field.defaultValue || '');
      });
      setFormData(defaultData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script?.id]);

  // Validação de campo individual
  const validateField = (field, value) => {
    const { name, required, validation, type } = field;

    // Campo obrigatório vazio
    if (required && !value) {
      return `${field.label} é obrigatório`;
    }

    // Se não tem valor e não é obrigatório, ok
    if (!value) return null;

    // Validações por tipo
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Email inválido';
        }
        break;

      case 'tel':
        const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
        if (!phoneRegex.test(value)) {
          return 'Telefone inválido (ex: (11) 98765-4321)';
        }
        break;

      case 'number':
        if (validation?.min && parseFloat(value) < validation.min) {
          return `Valor mínimo: ${validation.min}`;
        }
        if (validation?.max && parseFloat(value) > validation.max) {
          return `Valor máximo: ${validation.max}`;
        }
        break;
    }

    // Validações customizadas
    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return validation.message || 'Formato inválido';
      }
    }

    // Validação customizada para placa (formato brasileiro)
    if (name.toLowerCase().includes('placa')) {
      const placaRegex = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i;
      if (!placaRegex.test(value)) {
        return 'Placa inválida (ex: ABC-1234 ou ABC1D23)';
      }
    }

    // Validação de ano
    if (name.toLowerCase().includes('ano')) {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        return `Ano deve estar entre 1900 e ${currentYear + 1}`;
      }
    }

    return null;
  };

  // Valida todos os campos
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    script.dataSchema.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handler de mudança de campo
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Limpa erro do campo ao editar
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Handler de submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Carregar template
  const handleLoadTemplate = () => {
    if (!selectedTemplate) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      setFormData(template.data);
      setErrors({});
    }
  };

  // Salvar como template
  const handleSaveAsTemplate = () => {
    if (!validateForm()) {
      alert('Corrija os erros antes de salvar o template');
      return;
    }

    const templateName = prompt('Nome do template:');
    if (templateName) {
      onSaveTemplate?.({
        name: templateName,
        scriptId: script.id,
        data: formData,
        createdAt: new Date().toISOString()
      });
    }
  };

  if (!script?.dataSchema?.fields) {
    return (
      <div className="data-input-form-empty">
        <p>⚠️ Este script não possui campos configurados</p>
      </div>
    );
  }

  const requiredCount = script.dataSchema.fields.filter(f => f.required).length;
  const totalCount = script.dataSchema.fields.length;

  return (
    <div className="data-input-form">
      <div className="form-header">
        <h3>📝 Dados para executar o script</h3>
        <span className="field-counter">
          {requiredCount} obrigatório{requiredCount !== 1 ? 's' : ''} • {totalCount} total
        </span>
      </div>

      {/* Carregar template */}
      {templates.length > 0 && (
        <div className="template-loader">
          <label>💾 Carregar template salvo:</label>
          <div className="template-loader-controls">
            <select 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="template-select"
            >
              <option value="">Selecione um template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={handleLoadTemplate}
              disabled={!selectedTemplate}
              className="btn-load-template"
            >
              Carregar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Campos do formulário — agrupados por entidade quando group estiver definido */}
        <div className="form-fields">
          {(() => {
            const fields = script.dataSchema.fields;
            const hasGroups = fields.some(f => f.group);
            if (!hasGroups) {
              return fields.map(field => (
                <FormField
                  key={field.name}
                  field={field}
                  value={formData[field.name] || ''}
                  onChange={handleFieldChange}
                  error={errors[field.name]}
                />
              ));
            }
            // Agrupar campos
            const groups = [];
            const seen = [];
            fields.forEach(f => {
              const g = f.group || '';
              if (!seen.includes(g)) { seen.push(g); groups.push(g); }
            });
            return groups.map(group => (
              <div key={group} className="form-field-group">
                {group && <div className="form-group-header">{group}</div>}
                {fields.filter(f => (f.group || '') === group).map(field => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={handleFieldChange}
                    error={errors[field.name]}
                  />
                ))}
              </div>
            ));
          })()}
        </div>

        {/* Botões de ação */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            ❌ Cancelar
          </button>

          <button 
            type="button" 
            onClick={handleSaveAsTemplate}
            className="btn-save-template"
            title="Salvar estes dados como template reutilizável"
          >
            💾 Salvar Template
          </button>

          <button type="submit" className="btn-submit">
            ⚡ Executar Agora
          </button>
        </div>
      </form>

      {/* Informações adicionais */}
      {script.dataSchema.description && (
        <div className="form-footer">
          <p className="form-description">
            ℹ️ {script.dataSchema.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default DataInputForm;
