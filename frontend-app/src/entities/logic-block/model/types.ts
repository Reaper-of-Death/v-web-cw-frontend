export type LogicBlockType = 'AND' | 'OR' | 'NOT' | 'INPUT' | 'OUTPUT';

export interface LogicBlock {
  id: string;
  type: LogicBlockType;
  name: string;
  description: string;
  inputs: number;
  outputs: number;
  position?: {
    x: number;
    y: number;
  };
  properties?: Record<string, any>;
}

export interface BlockConnection {
  id: string;
  fromBlockId: string;     // ID блока-источника
  fromPortIndex: number;   // Индекс выхода в блоке-источнике
  toBlockId: string;       // ID блока-приемника
  toPortIndex: number;     // Индекс входа в блоке-приемнике
}

export interface Port {
  blockId: string;
  portIndex: number;
  type: 'input' | 'output';
}

export interface ConnectionPoint {
  x: number;
  y: number;
}

export interface WorkspaceState {
  blocks: LogicBlock[];
  connections: BlockConnection[];
  selectedElement?: LogicBlock | BlockConnection | null;
}