import React from 'react';
import '../styles/Table.css';

export interface Action<T> {
  label: string | ((row: T) => string);
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  className?: string | ((row: T) => string);
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: (row: T) => string;
}

interface TableProps<T> {
  rows: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  emptyMessage: string;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

const Table = <T,>({ rows, columns, actions, emptyMessage, className, rowClassName, onRowClick }: TableProps<T>) => {
  return (
    <div className={`table-container ${className || ''}`}>
      {rows.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowClassName ? rowClassName(row) : ''}
                onClick={() => onRowClick && onRowClick(row)}
                style={onRowClick ? { cursor: 'pointer' } : {}}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={column.className ? column.className(row) : ''}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode)}
                  </td>
                ))}
                {actions && (
                  <td className="actions-cell">
                    {actions.map((action, actionIndex) => {
                      const label = typeof action.label === 'function' ? action.label(row) : action.label;
                      const className = typeof action.className === 'function' ? action.className(row) : action.className;
                      const disabled = action.disabled ? action.disabled(row) : false;
                      return (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          disabled={disabled}
                          className={`action-btn ${className || ''}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;