import React from 'react';
import { LogicBlock } from '../../../../shared/ui/LogicBlock/LogicBlock';
import { LOGIC_BLOCKS } from '../../../../entities/logic-block/model/consts';
import type { LogicBlock as LogicBlockType } from '../../../../entities/logic-block/model/types';

interface BlockListProps {
  selectedBlockId: string | null;
  onBlockSelect: (block: LogicBlockType) => void;
}

export const BlockList: React.FC<BlockListProps> = ({ 
  selectedBlockId, 
  onBlockSelect 
}) => {
  return (
    <div className="block-list">
      <h3 className="list-title">Доступные блоки</h3>
      <div className="blocks-container">
        {LOGIC_BLOCKS.map((block) => (
          <LogicBlock
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={onBlockSelect}
          />
        ))}
      </div>
    </div>
  );
};