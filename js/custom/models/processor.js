/**
 * Representa um Processador
 * @class
 */
export class Processor {
    /**
     * @constructs
     * @param {number} number - INdex do Processador
     * @param {string} uuid - UUID do Processador 
     * @param {string} name - Nome do Processador
     * @param {number} temperature - Temperatura máxima suportada pelo Processador
     * @param {number} clock - Clock máximo alcançado pelo Processador
     * @param {number} power - Potência máxima atingida pelo Processador
     * @param {number} cores - Quantidade de Núcleos do Processador
     */
    constructor(number, uuid, name, temperature, clock, power, cores) {
        this.number = number;
        this.uuid = uuid;
        this.name = name;
        this.temperature = temperature;
        this.clock = clock;
        this.power = power;
        this.cores = cores;
    }

    /**
     * Cria e Retorna uma nova instância de um Processador "vazio"
     * @returns {Processor}
     */
    static empty() {
        return new Processor(0, '', '', 0, 0, 0, 0);
    }
}

/**
 * Representa as informações de Leitura de um Processador
 * @class
 */
 export class ProcessorReading {
    /**
     * @constructs
     * @param {string} uuid - UUID do Processador 
     * @param {object} readings - Sensores do Processador
     */
    constructor(uuid, readings) {
        this.uuid = uuid;
        this.readings = readings;
    }

    /**
     * Cria e Retorna uma nova instância de um Leitura "vazia"
     * @returns {ProcessorReading}
     */
    static empty() {
        return new ProcessorReading('', {load: 0, temperature: 0, power: 0, clock: 0});
    }
}