import { Cpu } from "./cpu.js";
import { Gpu } from "./gpu.js";
import { Ram } from "./ram.js";
import { StorageDevice } from "./storagedevice.js";

/**
 * Representa um Computador
 * @class
 */
export class Computer {
    /**
     * @constructs
     * @param {string} name - O Nome do Computador
     * @param {Cpu[]} cpus - Lista de CPUs que o Computador possui
     * @param {Gpu[]} gpus - Lista de GPUs que o Computador possui
     * @param {StorageDevice[]} storagedevices - Lista de Dispositivos de Armazenamento que o Computador possui
     * @param {Ram} ram - Memória RAm do Computador
     * @param {boolean} status - Estado atual do Computador (Ligado / Desligado)
     */
    constructor(name, cpus, gpus, storagedevices, ram, status) {
        this.name = name;
        this.cpus = cpus;
        this.gpus = gpus;
        this.storagedevices = storagedevices;
        this.ram = ram;
        this.status = status;
    }

    /**
     * Cria e Retorna uma nova instância de um Computador "vazio"
     * @returns {Computer} Nova Instância de Computador
     */
    static empty() {
        return new Computer(
            '', 
            [Cpu.empty()], 
            [Gpu.empty()], 
            [StorageDevice.empty()],
            Ram.empty(),
            false
        );
    }
}