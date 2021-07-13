
/**
 * Representa um Dispositivo de Armazenamento
 * @class
 */
export class Storage {
    /**
     * @constructor
     * @param {number} index - Index do Dispositivo de Armazenamento
     * @param {string} uuid - UUID do Dispositivo de Armazenamento 
     * @param {string} name - Nome do Dispositivo de Armazenamento
     * @param {string} disks - Disco representado pelo Dispositivo de Armazenamento
     * @param {number} size - Tamanho do Dispositivo de Armazenamento
     */
    constructor(id, uuid, name, disks, size) {
        this.id = id;
        this.uuid = uuid;
        this.name = name;
        this.disks = disks;
        this.size = size;
    }

    /**
     * Cria e Retorna uma nova instância de um Dispositivo de Armazenamento "vazio"
     * @returns {Storage}
     */
    static empty() {
        return new Storage(0, '', '', '', 0);
    }
}

/**
 * Representa a Leitura de um Dispositivo de Armazenamento
 * @class
 */
 export class StorageReading {
    /**
     * @constructor
     * @param {string} uuid - UUID do Dispositivo de Armazenamento 
     * @param {object} readings - Sensores do Dispositivo de Armazenamento
     */
    constructor(uuid, readings) {
        this.uuid = uuid;
        this.readings = readings;
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {StorageReading}
     */
    static empty() {
        return new StorageReading('', { temperature: 0, load: 0});
    }
}