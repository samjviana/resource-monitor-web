/**
 * Representa uma Memória RAM
 * @class
 */
export class Ram {
    /**
     * @constructor
     * @param {number} total - Capacidade Total da Memória RAM
     * @param {number} modules - Quantidade de Módulos de Memória
     */
    constructor(total, modules) {
        this.total = total;
        this.modules = modules;
    }

    /**
     * Cria e Retorna uma nova instância de uma Memória RAM "vazia"
     * @returns {Ram} 
     */
    static empty() {
        return new Ram(0, 0);
    }
}
