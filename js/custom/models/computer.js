import { Processor } from "./processor.js";
import { GPU } from "./gpu.js";
import { RAM } from "./ram.js";
import { Storage } from "./storage.js";
import { Motherboard } from "./motherboard.js";

/**
 * Representa um Computador
 * @class
 */
export class Computer {
    /**
     * @constructs
     * @param {string} name - O Nome do Computador
     * @param {string} uuid - UUID do Computador 
     * @param {Processor[]} processors - Lista de CPUs que o Computador possui
     * @param {GPU[]} gpus - Lista de GPUs que o Computador possui
     * @param {Storage[]} storages - Lista de Dispositivos de Armazenamento que o Computador possui
     * @param {RAM} ram - Memória RAm do Computador
     * @param {Motherboard} motherboard - Placa Mãe do Computador
     * @param {boolean} status - Estado atual do Computador (Ligado / Desligado)
     */
    constructor(name, uuid, partOfDomain, domain, workGroup, dnsName, domainRole, currentUser, 
        computerType, manufacturer, model, powerState, ownerContact, ownerName, supportContact, 
        systemType, thermalState, processors, gpus, storages, ram, motherboard, status
    ) {
        this.uuid = uuid;
        this.name = name;
        this.partOfDomain = partOfDomain;
        this.domain = domain;
        this.workGroup = workGroup;
        this.dnsName = dnsName;
        this.domainRole = domainRole;
        this.currentUser = currentUser;
        this.computerType = computerType;
        this.manufacturer = manufacturer;
        this.model = model;
        this.powerState = powerState;
        this.ownerContact = ownerContact;
        this.ownerName = ownerName;
        this.supportContact = supportContact;
        this.systemType = systemType;
        this.thermalState = thermalState;
        this.processors = processors;
        this.gpus = gpus;
        this.storages = storages;
        this.ram = ram;
        this.motherboard = motherboard;
        this.status = status;
    }

 

    /**
     * Cria e Retorna uma nova instância de um Computador "vazio"
     * @returns {Computer} Nova Instância de Computador
     */
    static empty() {
        let computer = new Computer();
        computer.name = '';
        computer.uuid = '';
        computer.processors = [Processor.empty()];
        computer.gpus = [GPU.empty()];
        computer.storages = [Storage.empty()];
        computer.ram = RAM.empty();
        computer.motherboard = Motherboard.empty();
        computer.status = false;
        return computer;
    }
}