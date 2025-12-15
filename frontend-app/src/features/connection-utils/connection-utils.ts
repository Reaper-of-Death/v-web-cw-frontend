import type { BlockConnection, LogicBlock, Port, ConnectionPoint } from '../../entities/logic-block/model/types';

export class ConnectionManager {
  static validateConnection(
    fromPort: Port,
    toPort: Port,
    blocks: LogicBlock[],
    connections: BlockConnection[]
  ): { isValid: boolean; error?: string } {
    // Проверяем, что порты принадлежат разным блокам
    if (fromPort.blockId === toPort.blockId) {
      return { isValid: false, error: 'Нельзя соединить порты одного блока' };
    }

    // Проверяем, что fromPort - выход, а toPort - вход
    if (fromPort.type !== 'output' || toPort.type !== 'input') {
      return { isValid: false, error: 'Можно соединять только выход с входом' };
    }

    // Проверяем, что вход еще не подключен
    const inputAlreadyConnected = connections.some(
      conn => conn.toBlockId === toPort.blockId && conn.toPortIndex === toPort.portIndex
    );
    
    if (inputAlreadyConnected) {
      return { isValid: false, error: 'Этот вход уже подключен' };
    }

    // Проверяем, что оба блока существуют
    const fromBlock = blocks.find(b => b.id === fromPort.blockId);
    const toBlock = blocks.find(b => b.id === toPort.blockId);
    
    if (!fromBlock || !toBlock) {
      return { isValid: false, error: 'Один из блоков не найден' };
    }

    // Проверяем допустимость индексов портов
    if (fromPort.portIndex >= fromBlock.outputs) {
      return { isValid: false, error: 'Неверный индекс выхода' };
    }
    
    if (toPort.portIndex >= toBlock.inputs) {
      return { isValid: false, error: 'Неверный индекс входа' };
    }

    // Проверяем на цикличность (предотвращаем создание циклов)
    if (this.wouldCreateCycle(fromPort.blockId, toPort.blockId, connections)) {
      return { isValid: false, error: 'Соединение создаст цикл в схеме' };
    }

    return { isValid: true };
  }

  static wouldCreateCycle(
    fromBlockId: string,
    toBlockId: string,
    connections: BlockConnection[]
  ): boolean {
    const visited = new Set<string>();
    const stack: string[] = [toBlockId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (current === fromBlockId) {
        return true;
      }

      if (!visited.has(current)) {
        visited.add(current);
        
        connections
          .filter(conn => conn.fromBlockId === current)
          .forEach(conn => {
            if (!visited.has(conn.toBlockId)) {
              stack.push(conn.toBlockId);
            }
          });
      }
    }

    return false;
  }

  static calculateConnectionPath(
    fromBlock: LogicBlock,
    fromPortIndex: number,
    toBlock: LogicBlock,
    toPortIndex: number
  ): ConnectionPoint[] {
    if (!fromBlock.position || !toBlock.position) {
      return [];
    }

    // Предполагаемые координаты портов (можно адаптировать под реальные размеры блоков)
    const fromX = fromBlock.position.x + 120; // правая сторона блока
    const fromY = fromBlock.position.y + 40 + (fromPortIndex * 25);
    const toX = toBlock.position.x; // левая сторона блока
    const toY = toBlock.position.y + 40 + (toPortIndex * 25);

    const midX = (fromX + toX) / 2;
    
    return [
      { x: fromX, y: fromY },
      { x: midX, y: fromY },
      { x: midX, y: toY },
      { x: toX, y: toY }
    ];
  }

  static getBlockValue(blockId: string, blocks: LogicBlock[], connections: BlockConnection[]): boolean | null {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return null;

    switch (block.type) {
      case 'INPUT':
        return block.properties?.value === true;
      
      case 'AND':
        // Получаем значения всех входов
        const andInputs = this.getBlockInputs(blockId, blocks, connections);
        if (andInputs.some(v => v === null)) return null;
        return andInputs.every(v => v === true);
      
      case 'OR':
        const orInputs = this.getBlockInputs(blockId, blocks, connections);
        if (orInputs.some(v => v === null)) return null;
        return orInputs.some(v => v === true);
      
      case 'NOT':
        const notInput = this.getBlockInputs(blockId, blocks, connections)[0];
        return notInput === null ? null : !notInput;
      
      case 'OUTPUT':
        const outputInput = this.getBlockInputs(blockId, blocks, connections)[0];
        return outputInput;
      
      default:
        return null;
    }
  }

  static getBlockInputs(blockId: string, blocks: LogicBlock[], connections: BlockConnection[]): (boolean | null)[] {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return [];

    const inputs: (boolean | null)[] = new Array(block.inputs).fill(null);
    
    connections
      .filter(conn => conn.toBlockId === blockId)
      .forEach(conn => {
        if (conn.toPortIndex < inputs.length) {
          const sourceValue = this.getBlockValue(conn.fromBlockId, blocks, connections);
          inputs[conn.toPortIndex] = sourceValue;
        }
      });

    return inputs;
  }

  static simulateCircuit(blocks: LogicBlock[], connections: BlockConnection[]): Map<string, boolean | null> {
    const results = new Map<string, boolean | null>();
    const processed = new Set<string>();
    
    // Функция для рекурсивного вычисления значения блока
    const calculateBlock = (blockId: string): boolean | null => {
      if (results.has(blockId)) {
        return results.get(blockId)!;
      }
      
      if (processed.has(blockId)) {
        return null;
      }
      
      processed.add(blockId);
      const value = this.getBlockValue(blockId, blocks, connections);
      results.set(blockId, value);
      processed.delete(blockId);
      
      return value;
    };
    
    blocks.forEach(block => {
      if (!results.has(block.id)) {
        calculateBlock(block.id);
      }
    });
    
    return results;
  }
}