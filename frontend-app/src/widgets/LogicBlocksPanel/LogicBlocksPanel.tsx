import React, { useState } from 'react';
import { LOGIC_BLOCKS } from '../../entities/logic-block/model/consts';
import type { LogicBlock } from '../../entities/logic-block/model/types';

interface LogicBlocksPanelProps {
  onBlockDragStart?: (block: LogicBlock) => void;
  onBlockSelect?: (block: LogicBlock) => void;
}

export const LogicBlocksPanel: React.FC<LogicBlocksPanelProps> = ({ 
  onBlockDragStart, 
  onBlockSelect 
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleBlockSelect = (block: LogicBlock) => {
    setSelectedBlockId(block.id);
    if (onBlockSelect) {
      onBlockSelect(block);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, block: LogicBlock) => {
    e.dataTransfer.setData('blockType', block.type);
    e.dataTransfer.setData('blockId', block.id);
    e.dataTransfer.setData('blockName', block.name);
    if (onBlockDragStart) {
      onBlockDragStart(block);
    }
  };

  const getBlockIcon = (type: string): string => {
    switch(type) {
      case 'AND': return '&';
      case 'OR': return '≥1';
      case 'NOT': return '1';
      default: return '?';
    }
  };

  return (
    <div className="logic-blocks-panel">
      <h2 className="panel-title">Логические блоки</h2>
      <div className="blocks-list">
        <div className="blocks-category">
          <h4 className="category-title">Базовые логические элементы</h4>
          <div className="blocks-grid">
            {LOGIC_BLOCKS.map((block) => (
              <div
                key={block.id}
                className={`draggable-block ${selectedBlockId === block.id ? 'selected' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, block)}
                onClick={() => handleBlockSelect(block)}
              >
                <div className="block-icon-large">{getBlockIcon(block.type)}</div>
                <div className="block-name">{block.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="blocks-info">
          <h3 className="list-title">Описание блоков</h3>
          <div className="blocks-description">
            {LOGIC_BLOCKS.map((block) => (
              <div 
                key={block.id} 
                className={`block-description-item ${selectedBlockId === block.id ? 'active' : ''}`}
                onClick={() => handleBlockSelect(block)}
              >
                <div className="description-header">
                  <span className="description-icon">{getBlockIcon(block.type)}</span>
                  <span className="description-title">{block.name}</span>
                </div>
                <p className="description-text">{block.description}</p>
                <div className="description-ports">
                  <span className="port-info">Входы: {block.inputs}</span>
                  <span className="port-info">Выходы: {block.outputs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};