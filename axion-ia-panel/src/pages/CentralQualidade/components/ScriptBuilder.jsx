import React, { useState } from 'react';
import './ScriptBuilder.css';

const FIELD_TYPES = [
  { value: 'text',     label: 'Texto' },
  { value: 'email',    label: 'E-mail' },
  { value: 'password', label: 'Senha' },
  { value: 'number',   label: 'Número' },
  { value: 'tel',      label: 'Telefone' },
  { value: 'date',     label: 'Data' },
  { value: 'select',   label: 'Lista (seleção)' },
];

/**
 * ScriptBuilder — permite criar um script de teste manualmente,
 * informando os campos a serem preenchidos quando o manual não
 * os detecta automaticamente.
 */
const ScriptBuilder = ({ script, onSave, onCancel }) => {
  const [name, setName] = useState(script?.name || '');
  const [description, setDescription] = useState(script?.description || '');
  const [menuPath, setMenuPath] = useState('');
  const [fields, setFields] = useState(
    script?.dataSchema?.fields || []
  );
  const [newField, setNewField] = useState({
    label: '', type: 'text', required: false, placeholder: '', hint: '', options: ''
  });
  const [error, setError] = useState('');

  const addField = () => {
    if (!newField.label.trim()) {
      setError('Informe o nome do campo');
      return;
    }
    setError('');

    const fieldId = newField.label
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    const field = {
      name: fieldId,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      ...(newField.placeholder && { placeholder: newField.placeholder }),
      ...(newField.hint && { hint: newField.hint }),
      ...(newField.type === 'select' && newField.options && {
        options: newField.options.split('\n').map(o => o.trim()).filter(Boolean)
      })
    };

    setFields(prev => [...prev, field]);
    setNewField({ label: '', type: 'text', required: false, placeholder: '', hint: '', options: '' });
  };

  const removeField = (index) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    setFields(prev => {
      const arr = [...prev];
      const to = index + direction;
      if (to < 0 || to >= arr.length) return arr;
      [arr[index], arr[to]] = [arr[to], arr[index]];
      return arr;
    });
  };

  const handleSave = () => {
    if (!name.trim()) { setError('Informe o nome do script'); return; }
    setError('');

    const built = {
      ...script,
      id: script?.id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: name.trim(),
      description: description.trim() || name.trim(),
      menuPath: menuPath.trim(),
      steps: Math.max(fields.length + 2, 4), // login + navegar + campos + salvar
      estimatedTime: `${(Math.max(fields.length + 2, 4)) * 2}s`,
      source: 'manual', // marcado como criado manualmente
      dataSchema: fields.length > 0 ? {
        description: `Dados para: ${name}`,
        fields
      } : null
    };

    onSave(built);
  };

  return (
    <div className="script-builder">
      <div className="builder-header">
        <h3>✏️ Criar Script Manualmente</h3>
        <p>
          Defina os campos que o sistema deve preencher ao executar este script.
          {script?.name && <> Baseado em: <strong>{script.name}</strong></>}
        </p>
      </div>

      {error && <div className="builder-error">⚠️ {error}</div>}

      {/* Identificação do script */}
      <div className="builder-section">
        <h4>📋 Identificação</h4>
        <div className="builder-row">
          <label>Nome do Script *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Cadastrar Usuário"
            className="builder-input"
          />
        </div>
        <div className="builder-row">
          <label>Descrição</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Cadastra um novo usuário no sistema"
            className="builder-input"
          />
        </div>
        <div className="builder-row">
          <label>Caminho no Menu</label>
          <input
            type="text"
            value={menuPath}
            onChange={e => setMenuPath(e.target.value)}
            placeholder="Ex: Menu → Controle de Acesso → Usuários"
            className="builder-input"
          />
          <span className="builder-hint">Onde está essa funcionalidade no sistema?</span>
        </div>
      </div>

      {/* Lista de campos já adicionados */}
      <div className="builder-section">
        <h4>📝 Campos do Formulário ({fields.length})</h4>

        {fields.length === 0 && (
          <div className="builder-empty">
            Nenhum campo adicionado ainda. Use o formulário abaixo para adicionar.
          </div>
        )}

        <div className="builder-fields-list">
          {fields.map((field, i) => (
            <div key={i} className="builder-field-item">
              <div className="field-item-info">
                <span className="field-item-label">{field.label}</span>
                <span className="field-item-type">{FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}</span>
                {field.required && <span className="field-item-required">Obrigatório</span>}
              </div>
              <div className="field-item-actions">
                <button onClick={() => moveField(i, -1)} disabled={i === 0} title="Mover para cima">↑</button>
                <button onClick={() => moveField(i, 1)} disabled={i === fields.length - 1} title="Mover para baixo">↓</button>
                <button onClick={() => removeField(i)} className="btn-remove" title="Remover campo">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adicionar novo campo */}
      <div className="builder-section builder-add-field">
        <h4>➕ Adicionar Campo</h4>
        <div className="add-field-grid">
          <div className="builder-row">
            <label>Nome do Campo *</label>
            <input
              type="text"
              value={newField.label}
              onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex: Nome Completo"
              className="builder-input"
              onKeyDown={e => e.key === 'Enter' && addField()}
            />
          </div>

          <div className="builder-row">
            <label>Tipo</label>
            <select
              value={newField.type}
              onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}
              className="builder-input"
            >
              {FIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="builder-row">
            <label>Placeholder</label>
            <input
              type="text"
              value={newField.placeholder}
              onChange={e => setNewField(p => ({ ...p, placeholder: e.target.value }))}
              placeholder="Ex: João da Silva"
              className="builder-input"
            />
          </div>

          <div className="builder-row">
            <label>Dica (hint)</label>
            <input
              type="text"
              value={newField.hint}
              onChange={e => setNewField(p => ({ ...p, hint: e.target.value }))}
              placeholder="Ex: Mínimo 3 caracteres"
              className="builder-input"
            />
          </div>

          {newField.type === 'select' && (
            <div className="builder-row full-width">
              <label>Opções (uma por linha)</label>
              <textarea
                value={newField.options}
                onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                placeholder={'Opção 1\nOpção 2\nOpção 3'}
                className="builder-input"
                rows={4}
              />
            </div>
          )}

          <div className="builder-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))}
              />
              Campo obrigatório
            </label>
          </div>
        </div>

        <button onClick={addField} className="btn-add-field">
          ➕ Adicionar Campo
        </button>
      </div>

      {/* Ações finais */}
      <div className="builder-actions">
        <button onClick={onCancel} className="btn-cancel">❌ Cancelar</button>
        <button onClick={handleSave} className="btn-save" disabled={!name.trim()}>
          💾 Salvar Script ({fields.length} campo{fields.length !== 1 ? 's' : ''})
        </button>
      </div>
    </div>
  );
};

export default ScriptBuilder;
