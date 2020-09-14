/**
 * Representa uma Placa de Vídeo
 * @class
 */
export class Gpu {
    /**
     * @constructor
     * @param {number} id - ID da Placa de Vídeo
     * @param {string} name - Nome da Placa de Vídeo
     * @param {number} temperature - Temperatura Máxima da Placa de Vídeo
     * @param {number} coreclock - Clock Máximo do Núcleo da Placa de Vídeo
     * @param {number} memoryclock - Clock Máximo da Memória da Placa de Vídeo
     */
    constructor(id, name, temperature, coreclock, memoryclock) {
        this.id = id;
        this.name = name;
        this.temperature = temperature;
        this.coreclock = coreclock;
        this.memoryclock = memoryclock;
    }

    /**
     * Cria e Retorna uma nova instância de uma Placa de Vídeo "vazia"
     * @returns {Gpu} 
     */
    static empty() {
        return new Gpu(0, '', 0, 0, 0);
    }
}
