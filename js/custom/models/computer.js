import { Cpu } from "./cpu.js";
import { Gpu } from "./gpu.js";

/**
 * Representa um Computador
 * @class
 */
export class Computer {
    /**
     * @constructs
     * @param {string} name - O Nome do Computador
     * @param {Cpu[]} cpus - Lista de CPUs que o Computadaor possui
     * @param {Gpu[]} gpus - Lista de GPUs que o Computadaor possui
     * @param {boolean} status - Estado atual do Computador (Ligado / Desligado)
     */
    constructor(name, cpus, gpus, status) {
        this.name = name;
        this.cpus = cpus;
        this.gpus = gpus;
        this.status = status;
    }

    /**
     * Cria e Retorna uma nova instância de um Computador "vazio"
     * @returns {Computer} Nova Instância de Computador
     */
    static empty() {
        return new Computer('', [Cpu.empty()], [Gpu.empty()], false);
    }
}