import { SuperIO } from './superio.js';

/**
 * Representa uma Placa Mãe
 * @class
 */
export class Motherboard {
    /**
     * @constructor
     * @param {string} uuid - UUID da Placa Mãe
     * @param {string} name - Nome da Placa Mãe
     * @param {SuperIO} superIO - Representa o Super IO da Placa Mãe
     */
    constructor(uuid, name, superIO) {
        this.uuid = uuid;
        this.name = name;
        this.superIO = superIO;
    }

    /**
     * Cria e Retorna uma nova instância de uma Placa Mãe "vazia"
     * @returns {Motherboard} 
     */
    static empty() {
        return new Motherboard('', '', SuperIO.empty());
    }
}
