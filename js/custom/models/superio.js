
/**
 * Representa um Super IO
 * @class
 */
export class SuperIO {
    /**
     * @constructor
     * @param {string} uuid - UUID do Super IO
     * @param {string} name - Nome do Super IO
     */
    constructor(uuid, name) {
        this.uuid = uuid;
        this.name = name;
    }

    /**
     * Cria e Retorna uma nova instância de um Super IO "vazia"
     * @returns {SuperIO} 
     */
    static empty() {
        return new SuperIO('', '');
    }
}
