/**
 * 📊 DATA TABLE COMPONENT
 * 
 * Componente reutilizável para exibir tabelas de dados
 * Features: sorting, click em linhas, loading, empty state
 * 
 * @created 2026-06-21
 * @refactor Fase 1 - Quick Wins
 */

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './DataTable.css';

/**
 * Componente Data Table
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array de objetos { key, header, width, align, render }
 * @param {Array} props.data - Array de objetos com os dados
 * @param {function} [props.onRowClick] - Callback quando uma linha é clicada
 * @param {boolean} [props.loading] - Se está carregando dados
 * @param {string} [props.emptyMessage] - Mensagem quando não há dados
 * @param {boolean} [props.sortable] - Se permite ordenação (padrão: true)
 * @param {boolean} [props.striped] - Se deve alternar cores das linhas
 * @param {boolean} [props.hoverable] - Se deve destacar linha no hover (padrão: true)
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  sortable = true,
  striped = false,
  hoverable = true,
  className = ''
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Função de sorting
  const requestSort = (key) => {
    if (!sortable) return;

    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Dados ordenados
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig, sortable]);

  const tableClasses = `
    data-table
    ${striped ? 'data-table--striped' : ''}
    ${hoverable ? 'data-table--hoverable' : ''}
    ${onRowClick ? 'data-table--clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Loading state
  if (loading) {
    return (
      <div className="data-table__loading">
        <LoadingSpinner text="Carregando dados..." />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="data-table__empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table__wrapper">
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortConfig.key === col.key;
              const sortIcon = isSorted
                ? sortConfig.direction === 'ascending'
                  ? ' ↑'
                  : ' ↓'
                : '';

              return (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                    cursor: sortable && col.sortable !== false ? 'pointer' : 'default'
                  }}
                  onClick={() => col.sortable !== false && requestSort(col.key)}
                  className={sortable && col.sortable !== false ? 'data-table__sortable' : ''}
                >
                  {col.header}{sortIcon}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyPress={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
            >
              {columns.map((col) => (
                <td
                  key={`${row.id || index}-${col.key}`}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
