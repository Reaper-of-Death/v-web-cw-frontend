import React from 'react';
import type { LogicBlock as LogicBlockType, LogicBlockType as BlockType } from '../../../entities/logic-block/model/types';

interface LogicBlockProps {
  block: LogicBlockType;
  onSelect: (block: LogicBlockType) => void;
  isSelected: boolean;
}

export const LogicBlock: React.FC<LogicBlockProps> = ({ 
  block, 
  onSelect, 
  isSelected 
}) => {
  const getBlockIcon = (type: BlockType): string => {
    switch(type) {
      case 'AND': return '&';
      case 'OR': return '≥1';
      case 'NOT': return '1';
      default: return '?';
    }
  };

  const getBlockColor = (type: BlockType): string => {
    switch(type) {
      case 'AND': return '#4caf50';
      case 'OR': return '#2196f3';
      case 'NOT': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <div 
      className={`logic-block ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(block)}
      style={{
        borderLeftColor: getBlockColor(block.type),
      }}
    >
      <div className="block-header">
        <div className="block-icon">{getBlockIcon(block.type)}</div>
        <div className="block-title">{block.name}</div>
      </div>
      <div className="block-description">{block.description}</div>
      <div className="block-ports">
        <div className="inputs">
          {Array.from({ length: block.inputs }).map((_, i) => (
            <div key={`in-${i}`} className="port input-port"></div>
          ))}
        </div>
        <div className="outputs">
          {Array.from({ length: block.outputs }).map((_, i) => (
            <div key={`out-${i}`} className="port output-port"></div>
          ))}
        </div>
      </div>
    </div>
  );
};