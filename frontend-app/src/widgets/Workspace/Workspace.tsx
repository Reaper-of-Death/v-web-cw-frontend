import React, { useState, useRef, useEffect } from 'react';
import type { LogicBlock, BlockConnection, Port, ConnectionPoint } from '../../entities/logic-block/model/types';
import { BLOCK_CONFIG } from '../../entities/logic-block/model/consts';
import { ConnectionManager } from '../../features/connection-utils/connection-utils';

type BlockType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';

interface WorkspaceBlock {
  id: string;
  type: BlockType;
  originalId: string;
  name: string;
  inputs: number;
  outputs: number;
  color: string;
  icon: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  value?: boolean | null;
}

interface WorkspaceProps {
  selectedBlock?: LogicBlock | null;
  onBlockSelect?: (block: LogicBlock) => void;
}

interface DraggingConnection {
  fromBlockId: string;
  fromPortIndex: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface DraggingBlock {
  blockId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  selectedBlock, 
  onBlockSelect 
}) => {
  const [blocks, setBlocks] = useState<WorkspaceBlock[]>([]);
  const [connections, setConnections] = useState<BlockConnection[]>([]);
  const [draggingBlock, setDraggingBlock] = useState<DraggingBlock | null>(null);
  const [draggingConnection, setDraggingConnection] = useState<DraggingConnection | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<BlockConnection | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceRect, setWorkspaceRect] = useState<DOMRect | null>(null);

  // Обновляем размеры рабочей области при изменении
  useEffect(() => {
    const updateWorkspaceRect = () => {
      if (workspaceRef.current) {
        setWorkspaceRect(workspaceRef.current.getBoundingClientRect());
      }
    };

    updateWorkspaceRect();
    window.addEventListener('resize', updateWorkspaceRect);

    return () => {
      window.removeEventListener('resize', updateWorkspaceRect);
    };
  }, []);

  // Рассчитываем значения блоков при изменении схемы
  useEffect(() => {
    const circuitResults = ConnectionManager.simulateCircuit(
    blocks.map(b => ({
      id: b.id,
      type: b.type,
      name: b.name,
      description: '',
      inputs: b.inputs,
      outputs: b.outputs,
      position: b.position,
      properties: b.properties
    })),
    connections
  );

  setBlocks(prev => {
    const updated = prev.map(block => ({
      ...block,
      value: circuitResults.get(block.id) ?? null
    }));
    
    // Проверяем, изменилось ли что-то
    const changed = updated.some((b, i) => b.value !== prev[i]?.value);
    return changed ? updated : prev;
  });
  }, [blocks, connections]);

  // Начало перетаскивания блока
  const handleBlockMouseDown = (e: React.MouseEvent, block: WorkspaceBlock) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.button !== 0) return; // Только левая кнопка мыши
    
    if (!workspaceRect) return;
    
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingBlock({
      blockId: block.id,
      startX: block.position.x,
      startY: block.position.y,
      offsetX: e.clientX - rect.left - block.position.x,
      offsetY: e.clientY - rect.top - block.position.y
    });

    // Выделяем блок при начале перетаскивания
    handleBlockClick(block);
  };

  // Перемещение блока
  const handleMouseMove = (e: React.MouseEvent) => {
    // Перемещение соединения
    if (draggingConnection && workspaceRect) {
      setDraggingConnection({
        ...draggingConnection,
        currentX: e.clientX - workspaceRect.left,
        currentY: e.clientY - workspaceRect.top
      });
    }

    // Перемещение блока
    if (draggingBlock && workspaceRect) {
      const { blockId, offsetX, offsetY } = draggingBlock;
      
      let newX = e.clientX - workspaceRect.left - offsetX;
      let newY = e.clientY - workspaceRect.top - offsetY;

      // Ограничиваем перемещение в пределах рабочей области
      const blockWidth = 140;
      const blockHeight = 100;
      const padding = 10;

      newX = Math.max(padding, Math.min(newX, workspaceRect.width - blockWidth - padding));
      newY = Math.max(padding, Math.min(newY, workspaceRect.height - blockHeight - padding));

      // Округляем к сетке для красивого выравнивания
      const gridSize = 40;
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;

      setBlocks(prev => prev.map(block => 
        block.id === blockId 
          ? { ...block, position: { x: newX, y: newY } }
          : block
      ));
    }
  };

  // Завершение перетаскивания блока
  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingConnection) {
      handleConnectionDrop(e);
    }
    
    if (draggingBlock) {
      // Если блок был перемещен на небольшое расстояние, считаем это кликом
      const movedBlock = blocks.find(b => b.id === draggingBlock.blockId);
      if (movedBlock) {
        const distance = Math.sqrt(
          Math.pow(movedBlock.position.x - draggingBlock.startX, 2) +
          Math.pow(movedBlock.position.y - draggingBlock.startY, 2)
        );
        
        if (distance < 5) {
          // Это был клик, а не перетаскивание
          handleBlockClick(movedBlock);
        }
      }
    }

    setDraggingBlock(null);
    setDraggingConnection(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
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
    type: BlockType, 
    id: string, 
    name: string,
    x: number, 
    y: number
  ): WorkspaceBlock => {
    const config = BLOCK_CONFIG[type];
    
    const initialProperties: Record<string, any> = {};
    if (type === 'INPUT') {
      initialProperties.value = false;
    }
    
    // Округляем к сетке
    const gridSize = 40;
    const gridX = Math.round((x - 60) / gridSize) * gridSize;
    const gridY = Math.round((y - 40) / gridSize) * gridSize;
    
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      originalId: id,
      name: name || config.name,
      inputs: config.inputs,
      outputs: config.outputs,
      color: config.color,
      icon: config.icon,
      position: { 
        x: Math.max(20, gridX), 
        y: Math.max(20, gridY) 
      },
      properties: initialProperties,
      value: type === 'INPUT' ? false : null
    };
  };

  const handleBlockDragStart = (e: React.DragEvent<HTMLDivElement>, block: WorkspaceBlock) => {
    e.dataTransfer.setData('workspaceBlockId', block.id);
    e.dataTransfer.setData('workspaceBlockType', block.type);
  };

  const handleBlockClick = (block: WorkspaceBlock) => {
    setSelectedConnection(null);
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

  // Начало перетаскивания соединения от порта
  const handlePortMouseDown = (
    e: React.MouseEvent,
    blockId: string,
    portIndex: number,
    portType: 'input' | 'output'
  ) => {
    e.stopPropagation();
    
    if (portType === 'output') {
      const block = blocks.find(b => b.id === blockId);
      if (!block || !workspaceRect) return;

      setDraggingConnection({
        fromBlockId: blockId,
        fromPortIndex: portIndex,
        startX: e.clientX - workspaceRect.left,
        startY: e.clientY - workspaceRect.top,
        currentX: e.clientX - workspaceRect.left,
        currentY: e.clientY - workspaceRect.top
      });
    } else if (portType === 'input') {
      // Удаление существующего соединения при клике на вход
      const existingConnection = connections.find(
        conn => conn.toBlockId === blockId && conn.toPortIndex === portIndex
      );
      
      if (existingConnection) {
        setConnections(connections.filter(conn => conn.id !== existingConnection.id));
      }
    }
  };

  // Завершение перетаскивания соединения
  const handleConnectionDrop = (e: React.MouseEvent) => {
    if (!draggingConnection || !workspaceRect) {
      return;
    }

    // Проверяем, на какой элемент был отпущен курсор
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const portElement = element?.closest('.workspace-port');
    
    if (portElement) {
      const toBlockId = portElement.getAttribute('data-block-id');
      const toPortIndex = parseInt(portElement.getAttribute('data-port-index') || '-1');
      const portType = portElement.getAttribute('data-port-type') as 'input' | 'output';

      if (toBlockId && toPortIndex >= 0 && portType === 'input') {
        // Создаем соединение
        const fromPort: Port = {
          blockId: draggingConnection.fromBlockId,
          portIndex: draggingConnection.fromPortIndex,
          type: 'output'
        };

        const toPort: Port = {
          blockId: toBlockId,
          portIndex: toPortIndex,
          type: 'input'
        };

        const validation = ConnectionManager.validateConnection(
          fromPort,
          toPort,
          blocks.map(b => ({
            id: b.id,
            type: b.type,
            name: b.name,
            description: '',
            inputs: b.inputs,
            outputs: b.outputs,
            position: b.position,
            properties: b.properties
          })),
          connections
        );

        if (validation.isValid) {
          const newConnection: BlockConnection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromBlockId: draggingConnection.fromBlockId,
            fromPortIndex: draggingConnection.fromPortIndex,
            toBlockId: toBlockId,
            toPortIndex: toPortIndex
          };

          setConnections([...connections, newConnection]);
        } else {
          console.warn('Неверное соединение:', validation.error);
        }
      }
    }
  };

  // Функция для переключения значения источника сигнала
  const toggleInputValue = (blockId: string) => {
    setBlocks(blocks.map(block => {
      if (block.id === blockId && block.type === 'INPUT') {
        const newValue = !block.value;
        return {
          ...block,
          value: newValue,
          properties: {
            ...block.properties,
            value: newValue
          }
        };
      }
      return block;
    }));
  };

  const calculatePortPosition = (
    blockId: string,
    portIndex: number,
    portType: 'input' | 'output'
  ): { x: number; y: number } | null => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return null;

    const blockWidth = 140;
    const portSpacing = 25;
    const headerHeight = 40;

    let x = block.position.x;
    let y = block.position.y + headerHeight + (portIndex * portSpacing);

    if (portType === 'output') {
      x += blockWidth;
    }

    return { x, y };
  };

  const renderConnectionPath = (
    fromBlockId: string,
    fromPortIndex: number,
    toBlockId: string,
    toPortIndex: number
  ): string => {
    const fromPos = calculatePortPosition(fromBlockId, fromPortIndex, 'output');
    const toPos = calculatePortPosition(toBlockId, toPortIndex, 'input');

    if (!fromPos || !toPos) return '';

    const midX1 = fromPos.x + 50;
    const midX2 = toPos.x - 50;

    // Создаем изогнутую линию
    return `M ${fromPos.x} ${fromPos.y} 
            C ${midX1} ${fromPos.y}, 
              ${midX2} ${toPos.y}, 
              ${toPos.x} ${toPos.y}`;
  };

  const handleConnectionClick = (connection: BlockConnection) => {
    setSelectedConnection(connection);
    if (onBlockSelect) {
      const logicBlock: LogicBlock = {
        id: connection.id,
        type: 'AND', // Тип по умолчанию для соединения
        name: 'Соединение',
        description: `Соединение от блока ${connection.fromBlockId} к ${connection.toBlockId}`,
        inputs: 0,
        outputs: 0,
        properties: connection
      };
      onBlockSelect(logicBlock);
    }
  };

  const deleteSelectedConnection = () => {
    if (selectedConnection) {
      setConnections(connections.filter(conn => conn.id !== selectedConnection.id));
      setSelectedConnection(null);
    }
  };

  // Удаление блока и связанных соединений
  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    setConnections(connections.filter(
      conn => conn.fromBlockId !== blockId && conn.toBlockId !== blockId
    ));
  };

  // Функция для выравнивания блоков по сетке
  const alignBlocksToGrid = () => {
    const gridSize = 40;
    setBlocks(prev => prev.map(block => ({
      ...block,
      position: {
        x: Math.round(block.position.x / gridSize) * gridSize,
        y: Math.round(block.position.y / gridSize) * gridSize
      }
    })));
  };

  // Обработка нажатия клавиш для удаления и других операций
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnection) {
          deleteSelectedConnection();
        } else if (selectedBlock && !selectedBlock.type.includes('conn')) {
          deleteBlock(selectedBlock.id);
        }
      } else if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        alignBlocksToGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlock, selectedConnection]);

  return (
    <div className="workspace-area">
      <h2 className="panel-title">Рабочая область</h2>
      <div className="workspace-toolbar">
        <button 
          onClick={() => {
            if (selectedConnection) deleteSelectedConnection();
          }}
          disabled={!selectedConnection}
          className="toolbar-button"
        >
          Удалить соединение
        </button>
        <button 
          onClick={alignBlocksToGrid}
          disabled={blocks.length === 0}
          className="toolbar-button"
          title="Выровнять все блоки по сетке (Ctrl+G)"
        >
          Выровнять по сетке
        </button>
        <div className="toolbar-hint">
          {blocks.length > 0 && `Блоков: ${blocks.length} | Соединений: ${connections.length}`}
        </div>
      </div>
      <div 
        ref={workspaceRef}
        className="workspace-content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setDraggingBlock(null);
          setDraggingConnection(null);
        }}
      >
        {/* Фоновая сетка */}
        <div className="grid-background"></div>
        
        {/* SVG для отрисовки соединений */}
        <svg className="connections-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Существующие соединения */}
          {connections.map((connection) => {
            const path = renderConnectionPath(
              connection.fromBlockId,
              connection.fromPortIndex,
              connection.toBlockId,
              connection.toPortIndex
            );

            const isSelected = selectedConnection?.id === connection.id;

            return (
              <g key={connection.id} onClick={() => handleConnectionClick(connection)} style={{ cursor: 'pointer' }}>
                <path
                  d={path}
                  fill="none"
                  stroke={isSelected ? "#ff4081" : "#666"}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={isSelected ? "5,5" : "none"}
                  markerEnd="url(#arrowhead)"
                />
                {/* Точка соединения для клика */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="10"
                />
              </g>
            );
          })}

          {/* Перетаскиваемое соединение */}
          {draggingConnection && (
            <path
              d={`M ${draggingConnection.startX} ${draggingConnection.startY} 
                  L ${draggingConnection.currentX} ${draggingConnection.currentY}`}
              fill="none"
              stroke="#2196f3"
              strokeWidth="2"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
            />
          )}

          {/* Маркер для стрелки */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
        </svg>
        
        {/* Логические блоки в рабочей области */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`workspace-block ${selectedBlock?.id === block.id ? 'selected' : ''} ${
              draggingBlock?.blockId === block.id ? 'dragging' : ''
            }`}
            style={{
              left: `${block.position.x}px`,
              top: `${block.position.y}px`,
              borderColor: block.color,
              backgroundColor: selectedBlock?.id === block.id ? '#f0f7ff' : 'white',
              cursor: draggingBlock?.blockId === block.id ? 'grabbing' : 'grab'
            }}
            draggable={false}
            onDragStart={(e) => handleBlockDragStart(e, block)}
            onMouseDown={(e) => handleBlockMouseDown(e, block)}
            onClick={() => {}}
          >
            <div className="workspace-block-header">
              <div 
                className="workspace-block-icon"
                style={{ backgroundColor: `${block.color}20` }}
              >
                {block.icon}
              </div>
              <div className="workspace-block-title">{block.name}</div>
              <button 
                className="block-delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlock(block.id);
                }}
                title="Удалить блок (Delete)"
              >
                ×
              </button>
            </div>
            
            {block.type === 'INPUT' && (
              <div 
                className="input-value-indicator"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleInputValue(block.id);
                }}
              >
                {block.value ? '1 (Вкл)' : '0 (Выкл)'}
              </div>
            )}

            {block.type === 'OUTPUT' && (
              <div 
                className={`output-value-indicator ${
                  block.value === true ? 'true' : 
                  block.value === false ? 'false' : 'unknown'
                }`}
              >
                {block.value === true ? '1 (Вкл)' : 
                block.value === false ? '0 (Выкл)' : '? (Не подключен)'}
              </div>
            )}
            
            {['AND', 'OR', 'NOT'].includes(block.type) && block.value !== null && (
              <div 
                className={`block-value-indicator ${
                  block.value ? 'true' : 'false'
                }`}
              >
                {block.value ? '1' : '0'}
              </div>
            )}
            
            <div className="workspace-block-ports">
              <div className="workspace-inputs">
                {Array.from({ length: block.inputs }).map((_, i) => {
                  const isConnected = connections.some(
                    conn => conn.toBlockId === block.id && conn.toPortIndex === i
                  );
                  
                  return (
                    <div 
                      key={`in-${i}`} 
                      className={`workspace-port workspace-input ${isConnected ? 'connected' : ''}`}
                      data-block-id={block.id}
                      data-port-index={i}
                      data-port-type="input"
                      title={`Вход ${i + 1}${isConnected ? ' (подключен)' : ''}`}
                      onMouseDown={(e) => handlePortMouseDown(e, block.id, i, 'input')}
                      style={{
                        backgroundColor: isConnected ? block.color : '#ccc',
                        borderColor: isConnected ? block.color : '#999'
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="workspace-outputs">
                {Array.from({ length: block.outputs }).map((_, i) => (
                  <div 
                    key={`out-${i}`} 
                    className="workspace-port workspace-output"
                    data-block-id={block.id}
                    data-port-index={i}
                    data-port-type="output"
                    title={`Выход ${i + 1}`}
                    onMouseDown={(e) => handlePortMouseDown(e, block.id, i, 'output')}
                    style={{
                      backgroundColor: block.color,
                      borderColor: block.color
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="workspace-block-id">ID: {block.id.slice(-6)}</div>
            {draggingBlock?.blockId === block.id && (
              <div className="block-drag-hint">
                Перетаскивание...
              </div>
            )}
          </div>
        ))}
        
        {/* Состояние пустой области */}
        {blocks.length === 0 && (
          <div className="workspace-empty-state">
            <div className="empty-state-icon">📥</div>
            <p>Перетащите логические блоки сюда</p>
            <p className="empty-state-hint">или выберите блок из списка слева</p>
            <p className="empty-state-hint">Для перемещения блоков: зажмите левую кнопку мыши и перетащите</p>
          </div>
        )}
      </div>
    </div>
  );
};