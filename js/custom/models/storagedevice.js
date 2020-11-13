/**
 * Representa um Dispositivo de Armazenamento
 * @class
 */
export class StorageDevice {
    /**
     * @constructor
     * @param {number} id - ID do Dispositivo de Armazenamento
     * @param {string} name - Nome do Dispositivo de Armazenamento
     * @param {string} disk - Disco representado pelo Dispositivo de Armazenamento
     * @param {number} size - Tamanho do Dispositivo de Armazenamento
     * @param {number} read - Taxa de Leitura Máxima do Dispositivo de Armazenamento
     * @param {number} write - Taxa de Escrita Máxima do Dispositivo de Armazenamento
     */
    constructor(id, name, disk, size, read, write) {
        this.id = id;
        this.name = name;
        this.disk = disk;
        this.size = size;
        this.read = read;
        this.write = write;
    }

    /**
     * Cria e Retorna uma nova instância de um Dispositivo de Armazenamento "vazio"
     * @returns {StorageDevice}
     */
    static empty() {
        return new StorageDevice(0, '', '', 0, 0, 0);
    }
}