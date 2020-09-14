/**
 * Representa as informações de Leitura de um Processador
 * @class
 */
export class CpuReading {
    /**
     * @constructs
     * @param {number} load - Porcentagem de Uso atual do Processador
     * @param {number} temperature - Temperatura atual do Processador
     * @param {number} clock - Clock atual do Processador
     * @param {number} power - Potência atual do Processador
     */
    constructor(load, temperature, clock, power) {
        this.load = load;
        this.temperature = temperature;
        this.clock = clock;
        this.power = power;
    }

    /**
     * Cria e Retorna uma nova instância de um Leitura "vazia"
     * @returns {CpuReading}
     */
    static empty() {
        return new CpuReading(0, 0, 0, 0);
    }
}