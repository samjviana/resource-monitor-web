
/**
 * Representa uma Placa de Vídeo
 * @class
 */
export class GPU {
    /**
     * @constructor
     * @param {number} number - Index da Placa de Vídeo
     * @param {string} uuid - UUID da Placa de Vídeo 
     * @param {string} name - Nome da Placa de Vídeo
     * @param {number} temperature - Temperatura Máxima da Placa de Vídeo
     * @param {number} coreClock - Clock Máximo do Núcleo da Placa de Vídeo
     * @param {number} memoryClock - Clock Máximo da Memória da Placa de Vídeo
     * @param {number} power - Potência Máxima da Placa de Vídeo
     */
    constructor(number, uuid, name, temperature, coreClock, memoryClock, power) {
        this.number = number;
        this.uuid = uuid;
        this.name = name;
        this.temperature = temperature;
        this.coreClock = coreClock;
        this.memoryClock = memoryClock;
        this.power = power;
    }

    /**
     * Cria e Retorna uma nova instância de uma Placa de Vídeo "vazia"
     * @returns {GPU} 
     */
    static empty() {
        return new GPU(0, '', '', 0, 0, 0, 0);
    }
}

/**
 * Representa as informações de Leitura de uma Placa de Vídeo
 * @class
 */
 export class GpuReading {
    /**
     * @constructor
     * @param {string} uuid - UUID da Placa de Vídeo 
     * @param {object} readings - Sensores da Placa de Vídeo
     * @param {number} load - Porcentagem de Uso geral da Placa de Vídeo
     * @param {number} power - Potência máxima atingida pela Placa de Vídeo
     * @param {number} temperature - Temperatura Atual da Placa de Vídeo
     * @param {number} coreclock - Clock Atual do Núcleo da Placa de Vídeo
     * @param {number} memoryclock - Clock Atual da Memória da Placa de Vídeo
     */
    constructor(uuid, readings) {
        this.uuid = uuid;
        this.readings = readings;
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {GpuReading}
     */
    static empty() {
        return new GpuReading('', {load: 0, temperature: 0, coreClock: 0, memoryClock: 0, power: 0});
    }
}
