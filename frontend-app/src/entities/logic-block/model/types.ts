export type LogicBlockType = 'AND' | 'OR' | 'NOT';

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
  from: string; // ID блока-источника
  to: string;   // ID блока-приемника
  outputIndex: number;
  inputIndex: number;
}