
/**
 * Representa um Módulo de Memória RAM
 * @class
 */
export class PhysicalMemory {
    /**
     * @constructor
     * @param {string} uuid - UUID do Módulo de Memória
     * @param {number} capacity - Capacidade do Módulo de Memória
     */
    constructor(uuid, capacity) {
        this.uuid = uuid;
        this.capacity = capacity;
    }

    /**
     * Cria e Retorna uma nova instância de um Módulo de Memória "vazia"
     * @returns {PhysicalMemory} 
     */
    static empty() {
        return new PhysicalMemory('', 0);
    }
}
