import { PhysicalMemory } from './physicalmemory.js';

/**
 * Representa uma Memória RAM
 * @class
 */
export class RAM {
    /**
     * @constructor
     * @param {string} uuid - UUID da Memória RAM
     * @param {number} total - Capacidade Total da Memória RAM
     * @param {PhysicalMemory[]} physicalMemories - Módulos de Memória
     */
    constructor(uuid, total, physicalMemories) {
        this.uuid = uuid;
        this.total = total;
        this.physicalMemories = physicalMemories;
    }

    /**
     * Cria e Retorna uma nova instância de uma Memória RAM "vazia"
     * @returns {RAM} 
     */
    static empty() {
        return new RAM('', 0);
    }
}

/**
 * Representa as informações de Leitura de uma Memória RAM
 * @class
 */
export class RamReading {
    /**
     * @constructor
     * @param {string} uuid - UUID da Memória RAM
     * @param {Object}
     * @param {number} load - Porcentagem de Uso da Memória RAM
     * @param {number} used - Quantidade de Memória RAM Usada
     * @param {number} free - Quantidade de Memória RAM Livre
     */
    constructor(uuid, readings) {
        this.uuid = uuid;
        this.readings = readings
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {RamReading}
     */
    static empty() {
        return new RamReading('', {load: 0, used: 0, free: 0});
    }
}