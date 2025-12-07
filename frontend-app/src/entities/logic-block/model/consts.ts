import type { LogicBlock } from "./types";

export const LOGIC_BLOCKS: LogicBlock[] = [
  {
    id: 'and-1',
    type: 'AND',
    name: 'Логическое И',
    description: 'Выдает true, если все входы true',
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'or-1',
    type: 'OR',
    name: 'Логическое ИЛИ',
    description: 'Выдает true, если хотя бы один вход true',
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'not-1',
    type: 'NOT',
    name: 'Логическое НЕ',
    description: 'Инвертирует входной сигнал',
    inputs: 1,
    outputs: 1,
  },
];

export const BLOCK_ICONS: Record<string, string> = {
  'AND': '&',
  'OR': '≥1',
  'NOT': '1'
};