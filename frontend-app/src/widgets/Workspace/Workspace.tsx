import React, { useState } from 'react';
import type { LogicBlock } from '../../entities/logic-block/model/types';

interface WorkspaceBlock {
  id: string;
  type: 'AND' | 'OR' | 'NOT';
  originalId: string;
  name: string;
  inputs: number;
  outputs: number;
  color: string;
  icon: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

interface WorkspaceProps {
  selectedBlock?: LogicBlock | null;
  onBlockSelect?: (block: LogicBlock) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  selectedBlock, 
  onBlockSelect 
}) => {
  const [blocks, setBlocks] = useState<WorkspaceBlock[]>([]);
  const [draggingBlock, setDraggingBlock] = useState<WorkspaceBlock | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const blockType = e.dataTransfer.getData('blockType') as 'AND' | 'OR' | 'NOT';
    const blockId = e.dataTransfer.getData('blockId');
    const blockName = e.dataTransfer.getData('blockName');
    
    if (!blockType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock = createBlock(blockType, blockId, blockName, x, y);
    setBlocks([...blocks, newBlock]);
  };

  const createBlock = (
    type: 'AND' | 'OR' | 'NOT', 
    id: string, 
    name: string,
    x: number, 
    y: number
  ): WorkspaceBlock => {
    const baseBlocks = {
      'AND': {
        name: name || 'И',
        inputs: 2,
        outputs: 1,
        color: '#4caf50',
        icon: '&'
      },
      'OR': {
        name: name || 'ИЛИ',
        inputs: 2,
        outputs: 1,
        color: '#2196f3',
        icon: '≥1'
      },
      'NOT': {
        name: name || 'НЕ',
        inputs: 1,
        outputs: 1,
        color: '#ff9800',
        icon: '1'
      }
    };

    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      originalId: id,
      ...baseBlocks[type],
      position: { x: Math.max(20, x - 60), y: Math.max(20, y - 40) },
      properties: {}
    };
  };

  const handleBlockDragStart = (e: React.DragEvent<HTMLDivElement>, block: WorkspaceBlock) => {
    setDraggingBlock(block);
    e.dataTransfer.setData('workspaceBlockId', block.id);
    e.dataTransfer.setData('workspaceBlockType', block.type);
  };

  const handleBlockDragEnd = () => {
    setDraggingBlock(null);
  };

  const handleBlockClick = (block: WorkspaceBlock) => {
    if (onBlockSelect) {
      const logicBlock: LogicBlock = {
        id: block.id,
        type: block.type,
        name: block.name,
        description: `${block.type} блок в рабочей области`,
        inputs: block.inputs,
        outputs: block.outputs,
        position: block.position,
        properties: block.properties
      };
      onBlockSelect(logicBlock);
    }
  };

  const handleDragOverBlock = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggingBlock) {
      e.preventDefault();
      e.currentTarget.style.border = '2px dashed #2196f3';
    }
  };

  const handleDragLeaveBlock = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.border = '';
  };

  const handleDropOnBlock = (e: React.DragEvent<HTMLDivElement>, targetBlock: WorkspaceBlock) => {
    e.preventDefault();
    e.currentTarget.style.border = '';
    
    const sourceBlockId = e.dataTransfer.getData('workspaceBlockId');
    if (sourceBlockId && sourceBlockId !== targetBlock.id) {
      // Здесь можно добавить логику соединения блоков
      console.log(`Соединение блока ${sourceBlockId} с блоком ${targetBlock.id}`);
    }
  };

  return (
    <div className="workspace-area">
      <h2 className="panel-title">Рабочая область</h2>
      <div 
        className="workspace-content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Фоновая сетка */}
        <div className="grid-background"></div>
        
        {/* Логические блоки в рабочей области */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="workspace-block"
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              borderColor: block.color,
              backgroundColor: selectedBlock?.id === block.id ? '#f0f7ff' : 'white'
            }}
            draggable={true}
            onDragStart={(e) => handleBlockDragStart(e, block)}
            onDragEnd={handleBlockDragEnd}
            onDragOver={handleDragOverBlock}
            onDragLeave={handleDragLeaveBlock}
            onDrop={(e) => handleDropOnBlock(e, block)}
            onClick={() => handleBlockClick(block)}
          >
            <div className="workspace-block-header">
              <div 
                className="workspace-block-icon"
                style={{ backgroundColor: `${block.color}20` }}
              >
                {block.icon}
              </div>
              <div className="workspace-block-title">{block.name}</div>
            </div>
            <div className="workspace-block-ports">
              <div className="workspace-inputs">
                {Array.from({ length: block.inputs }).map((_, i) => (
                  <div 
                    key={`in-${i}`} 
                    className="workspace-port workspace-input"
                    title={`Вход ${i + 1}`}
                  ></div>
                ))}
              </div>
              <div className="workspace-outputs">
                {Array.from({ length: block.outputs }).map((_, i) => (
                  <div 
                    key={`out-${i}`} 
                    className="workspace-port workspace-output"
                    title={`Выход ${i + 1}`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="workspace-block-id">ID: {block.id.slice(-6)}</div>
          </div>
        ))}
        
        {/* Состояние пустой области */}
        {blocks.length === 0 && (
          <div className="workspace-empty-state">
            <div className="empty-state-icon">📥</div>
            <p>Перетащите логические блоки сюда</p>
            <p className="empty-state-hint">или выберите блок из списка слева</p>
          </div>
        )}
      </div>
    </div>
  );
};