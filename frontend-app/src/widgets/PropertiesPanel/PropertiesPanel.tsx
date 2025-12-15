import React from 'react';
import type { LogicBlock } from '../../entities/logic-block/model/types';

interface PropertiesPanelProps {
  selectedBlock: LogicBlock | null;
}

interface TruthTableRow {
  inputs?: number[];
  input?: number;
  output: number;
}

interface BlockDetails {
  truthTable?: TruthTableRow[];
  description: string;
  formula?: string;
  symbol?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedBlock }) => {
  const renderProperties = () => {
    if (!selectedBlock) {
      return (
        <div className="properties-empty-state">
          <div className="empty-state-icon">⚙️</div>
          <p>Выберите логический блок</p>
          <p className="empty-state-hint">для просмотра и редактирования свойств</p>
        </div>
      );
    }

    const getBlockDetails = (type: string): BlockDetails => {
      switch(type) {
        case 'AND':
          return {
            truthTable: [
              { inputs: [0, 0], output: 0 },
              { inputs: [0, 1], output: 0 },
              { inputs: [1, 0], output: 0 },
              { inputs: [1, 1], output: 1 }
            ],
            description: 'Логическое умножение (конъюнкция). Возвращает истину только если все входы истинны.',
            formula: 'A ∧ B',
            symbol: '&'
          };
        case 'OR':
          return {
            truthTable: [
              { inputs: [0, 0], output: 0 },
              { inputs: [0, 1], output: 1 },
              { inputs: [1, 0], output: 1 },
              { inputs: [1, 1], output: 1 }
            ],
            description: 'Логическое сложение (дизъюнкция). Возвращает истину если хотя бы один вход истинен.',
            formula: 'A ∨ B',
            symbol: '≥1'
          };
        case 'NOT':
          return {
            truthTable: [
              { input: 0, output: 1 },
              { input: 1, output: 0 }
            ],
            description: 'Логическое отрицание (инверсия). Возвращает противоположное значение входного сигнала.',
            formula: '¬A',
            symbol: '1'
          };
        case 'INPUT':
          return {
            truthTable: [
              { input: 0, output: 1 },
              { input: 1, output: 0 }
            ],
            description: 'Источник сигнала, который может быть установлен в 0 (логический ноль) или 1 (логическая единица).',
            formula: '-',
            symbol: 'IN'
          };
        case 'OUTPUT':
          return {
            truthTable: [
              { input: 0, output: 1 },
              { input: 1, output: 0 }
            ],
            description: 'Отображает результат работы логической схемы. Может принимать значения 0 или 1.',
            formula: '-',
            symbol: 'OUT'
          };
        default:
          return {
            description: 'Неизвестный тип блока'
          };
      }
    };

    const details = getBlockDetails(selectedBlock.type);

    return (
      <div className="properties-content">
        <div className="property-section">
          <div className="property-header">
            <div 
              className="property-icon"
              style={{ 
                backgroundColor: selectedBlock.type === 'AND' ? '#4caf5020' : 
                                selectedBlock.type === 'OR' ? '#2196f320' : 
                                '#ff980020'
              }}
            >
              {details.symbol}
            </div>
            <div>
              <h3 className="property-title">{selectedBlock.name}</h3>
              <div className="property-type">{selectedBlock.type}</div>
            </div>
          </div>
          <p className="property-description">{selectedBlock.description}</p>
        </div>

        <div className="property-section">
          <h4 className="property-subtitle">Основные параметры</h4>
          <div className="property-grid">
            <div className="property-item">
              <span className="property-label">Входы:</span>
              <span className="property-value">{selectedBlock.inputs}</span>
            </div>
            <div className="property-item">
              <span className="property-label">Выходы:</span>
              <span className="property-value">{selectedBlock.outputs}</span>
            </div>
            {details.formula && (
              <div className="property-item">
                <span className="property-label">Формула:</span>
                <span className="property-value formula">{details.formula}</span>
              </div>
            )}
          </div>
        </div>

        {details.truthTable && (
          <div className="property-section">
            <h4 className="property-subtitle">Таблица истинности</h4>
            <div className="truth-table-container">
              <table className="truth-table">
                <thead>
                  <tr>
                    {selectedBlock.type === 'NOT' ? (
                      <>
                        <th>A</th>
                        <th>¬A</th>
                      </>
                    ) : (
                      <>
                        <th>A</th>
                        <th>B</th>
                        <th>Результат</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {details.truthTable.map((row, index) => (
                    <tr key={index}>
                      {row.inputs ? (
                        <>
                          <td>{row.inputs[0]}</td>
                          <td>{row.inputs[1]}</td>
                          <td className="output-cell">{row.output}</td>
                        </>
                      ) : (
                        <>
                          <td>{row.input}</td>
                          <td className="output-cell">{row.output}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="property-section">
          <h4 className="property-subtitle">Подробное описание</h4>
          <p className="property-text">{details.description}</p>
          {selectedBlock.position && (
            <div className="position-info">
              <div className="property-item">
                <span className="property-label">Позиция X:</span>
                <span className="property-value">{Math.round(selectedBlock.position.x)}px</span>
              </div>
              <div className="property-item">
                <span className="property-label">Позиция Y:</span>
                <span className="property-value">{Math.round(selectedBlock.position.y)}px</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="properties-panel">
      <h2 className="panel-title">Свойства блока</h2>
      {renderProperties()}
    </div>
  );
};