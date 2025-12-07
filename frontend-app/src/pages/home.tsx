import React, { useState } from 'react';
import { Header } from '../widgets/header/header';
import { LogicBlocksPanel } from '../widgets/LogicBlocksPanel/LogicBlocksPanel';
import { Workspace } from '../widgets/Workspace/Workspace';
import { PropertiesPanel } from '../widgets/PropertiesPanel/PropertiesPanel';
import type { LogicBlock } from '../entities/logic-block/model/types';

export const HomePage: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<LogicBlock | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<LogicBlock | null>(null);

  const handleBlockDragStart = (block: LogicBlock) => {
    setDraggedBlock(block);
  };

  const handleBlockSelect = (block: LogicBlock) => {
    setSelectedBlock(block);
  };

  return (
    <div className="home-page">
      <Header />
      
      <main className="main-area">
        <LogicBlocksPanel 
          onBlockDragStart={handleBlockDragStart}
          onBlockSelect={handleBlockSelect}
        />
        
        <Workspace 
          selectedBlock={selectedBlock}
          onBlockSelect={handleBlockSelect}
        />
        
        <PropertiesPanel 
          selectedBlock={selectedBlock}
        />
      </main>
    </div>
  );
};