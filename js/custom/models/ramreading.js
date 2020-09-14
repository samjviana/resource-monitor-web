/**
 * Representa as informações de Leitura de uma Memória RAM
 * @class
 */
export class RamReading {
    /**
     * @constructor
     * @param {number} load - Porcentagem de Uso da Memória RAM
     * @param {number} used - Quantidade de Memória RAM Usada
     * @param {number} free - Quantidade de Memória RAM Livre
     */
    constructor(load, used, free) {
        this.load = load;
        this.used = used;
        this.free = free;
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {RamReading}
     */
    static empty() {
        return new RamReading(0, 0, 0);
    }
}