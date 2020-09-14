/**
 * Representa a Leitura de um Dispositivo de Armazenamento
 * @class
 */
export class StorageReading {
    /**
     * @constructor
     * @param {number} usage - Uso Atual do Dispositivo de Armazenamento
     * @param {number} read - Taxa de Leitura do Dispositivo de Armazenamento
     * @param {number} write - Taxa de Escrita do Dispositivo de Armazenamento
     */
    constructor(usage, read, write) {
        this.usage = usage;
        this.read = read;
        this.write = write;
    }

    /**
     * Cria e Retorna uma nova instância de uma Leitura "vazia"
     * @returns {StorageReading}
     */
    static empty() {
        return new StorageReading(0, 0, 0);
    }
}