import type { LogicBlock } from "./types";

export const LOGIC_BLOCKS: LogicBlock[] = [
  {
    id: 'and-1',
    type: 'AND',
    name: 'И',
    description: 'Выдает true, если все входы true',
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'or-1',
    type: 'OR',
    name: 'ИЛИ',
    description: 'Выдает true, если хотя бы один вход true',
    inputs: 2,
    outputs: 1,
  },
  {
    id: 'not-1',
    type: 'NOT',
    name: 'НЕ',
    description: 'Инвертирует входной сигнал',
    inputs: 1,
    outputs: 1,
  },
  {
    id: 'input-1',
    type: 'INPUT',
    name: 'Источник сигнала',
    description: 'Генерирует сигнал (0 или 1)',
    inputs: 0,
    outputs: 1,
  },
  {
    id: 'output-1',
    type: 'OUTPUT',
    name: 'Прием сигнала',
    description: 'Отображает результат работы схемы',
    inputs: 1,
    outputs: 0,
  },
];

export const BLOCK_CONFIG = {
  'AND': {
    name: 'И',
    inputs: 2,
    outputs: 1,
    color: '#4caf50',
    icon: '&',
    symbol: '&',
    formula: 'A ∧ B',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 }
    ],
    fullDescription: 'Логическое умножение (конъюнкция). Возвращает истину только если все входы истинны.',
    category: 'Логические элементы'
  },
  'OR': {
    name: 'ИЛИ',
    inputs: 2,
    outputs: 1,
    color: '#2196f3',
    icon: '≥1',
    symbol: '≥1',
    formula: 'A ∨ B',
    truthTable: [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 }
    ],
    fullDescription: 'Логическое сложение (дизъюнкция). Возвращает истину если хотя бы один вход истинен.',
    category: 'Логические элементы'
  },
  'NOT': {
    name: 'НЕ',
    inputs: 1,
    outputs: 1,
    color: '#ff9800',
    icon: '1',
    symbol: '1',
    formula: '¬A',
    truthTable: [
      { input: 0, output: 1 },
      { input: 1, output: 0 }
    ],
    fullDescription: 'Логическое отрицание (инверсия). Возвращает противоположное значение входного сигнала.',
    category: 'Логические элементы'
  },
  'INPUT': {
    name: 'Источник сигнала',
    inputs: 0,
    outputs: 1,
    color: '#9c27b0',
    icon: 'IN',
    symbol: 'IN',
    formula: 'S',
    truthTable: [
      { input: 0, output: 0 },
      { input: 1, output: 1 }
    ],
    fullDescription: 'Источник сигнала, который может быть установлен в 0 (логический ноль) или 1 (логическая единица).',
    category: 'Терминальные элементы'
  },
  'OUTPUT': {
    name: 'Прием сигнала',
    inputs: 1,
    outputs: 0,
    color: '#f44336',
    icon: 'OUT',
    symbol: 'OUT',
    formula: 'O',
    truthTable: [],
    fullDescription: 'Отображает результат работы логической схемы. Может принимать значения 0 или 1.',
    category: 'Терминальные элементы'
  }
} as const;

export const BLOCK_ICONS: Record<string, string> = {
  'AND': '&',
  'OR': '≥1',
  'NOT': '1',
  'INPUT': 'IN',
  'OUTPUT': 'OUT'
};

// Тип для таблицы истинности
export interface TruthTableRow {
  inputs?: number[];
  input?: number;
  output: number;
}

// Тип для конфигурации блока
export type BlockConfigType = typeof BLOCK_CONFIG[keyof typeof BLOCK_CONFIG];