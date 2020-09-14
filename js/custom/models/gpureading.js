/**
 * Representa as informações de Leitura de uma Placa de Vídeo
 * @class
 */
export class GpuReading {
    /**
     * @constructor
     * @param {number} load - Porcentagem de Uso geral da Placa de Vídeo
     * @param {number} memoryload - Porcentagem de Uso da Memória da Placa de Vídeo
     * @param {number} temperature - Temperatura Atual da Placa de Vídeo
     * @param {number} coreclock - Clock Atual do Núcleo da Placa de Vídeo
     * @param {number} memoryclock - Clock Atual da Memória da Placa de Vídeo
     */
    constructor(load, memoryload, temperature, coreclock, memoryclock) {
        this.load = load;
        this.memoryload = memoryload;
        this.temperature = temperature;
        this.coreclock = coreclock;
        this.memoryclock = memoryclock;
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {GpuReading}
     */
    static empty() {
        return new GpuReading(0, 0, 0, 0, 0);
    }
}