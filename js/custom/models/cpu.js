/**
 * Representa um Processador
 * @class
 */
export class Cpu {
    /**
     * @constructs
     * @param {number} id - ID do Processador
     * @param {string} name - Nome do Processador
     * @param {number} temperature - Temperatura máxima suportada pelo Processador
     * @param {number} clock - Clock máximo alcançado pelo Processador
     * @param {number} power - Potência máxima atingida pelo Processador
     */
    constructor(id, name, temperature, clock, power) {
        this.id = id;
        this.name = name;
        this.temperature = temperature;
        this.clock = clock;
        this.power = power;
    }

    /**
     * Cria e Retorna uma nova instância de um Processador "vazio"
     * @returns {Cpu}
     */
    static empty() {
        return new Cpu(0, '', 0, 0, 0);
    }
}