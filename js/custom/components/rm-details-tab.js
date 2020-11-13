/**
 * Representa a lógica da Tab de Detalhes
 * @module DetailsTab
 */

import { _rmsidebar } from './rm-sidebar.js';
import * as CustomEvents from '../utils/events.js';
import { _rmcpucard } from "./rm-cpu-card.js";
import { _rmgpucard } from "./rm-gpu-card.js";
import { _rmramcard } from "./rm-ram-card.js";
import { _rmstoragecard } from "./rm-storage-card.js";
import { Computer } from '../models/computer.js';

 /**
  * Constante para acessar a DetailsTab no DOM
  * @constant {Element}
  */
export const _rmdetailstab = document.getElementById('rm-details-tab');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {Computer} computer=Computer.empty() Representa o Computador selecionado atualmente
 */
const parameters = {
    computer: Computer.empty()
}

/**
 * Variável para armezenar o estado anterior dos parâmetros do componente.
 * @constant {Object}
 */
let oldparameters = parameters;

/**
 * Variável para conter o invervalID da função que ficará executando em background
 * @constant {number}
 */
let bgInterval = null;

document.addEventListener('DOMContentLoaded', init);
_rmsidebar.addEventListener(CustomEvents.computerchanged, computerChanged);
_rmsidebar.addEventListener(CustomEvents.componentloaded, dataLoadListener);

/**
 * Função que deve ser executada para inicializar o componente
 */
function init() {
    
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {

}

/**
 * Atualiza o parâmetro passado com o valor informado e salva o estado anterior dos parâmetros
 * @param {string} parameter - O Nome do parâmetro a ser alterado
 * @param {any} value - O Valor a ser definido para o parâmetro
 */
function updateParameters(parameter, value) {
    if (parameters[parameter] === undefined) {
        console.error(`O Parâmetro ${parameter} não existe.\n`);
        return;
    }

    oldparameters = parameters

    parameters[parameter] = value;

    CustomEvents.triggerEvent(_rmcpucard, CustomEvents.paramchanged);
}

/**
 * Função responsável por aguardar o carregamento dos dados do computador selecionado.
 * Esses dados serão mostrados numa lista gerada a partida da coleta dos mesmo.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener
 */
function dataLoadListener(event) {
    switch (event.target.id) {
        case 'rm-sidebar':
            updateParameters('computer', event.detail.currentcomputer);
            break;
        default:
            break;
    }

    console.log(parameters.computer);
    if (parameters.computer !== null) {
        buildCpuDetails();
        buildGpuDetails();
        buildRamDetails();
        buildStorageDeviceDetails();
    }
}

/**
 * Função que constroi a lista de detalhes das CPUs e insere a lista no DOM
 */
function buildCpuDetails() {
    let createLiElement = function(cpu) {
        return `
            <li>
                <div class="font-weight-bold pb-2"> ${cpu.name} </div>
                <div class="content">
                    <div class="d-flex justify-content-between">
                        <div> Temperatura Suportada: </div>
                        <div> ${cpu.temperature} °C </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Clock Máximo: </div>
                        <div> ${cpu.clock} MHz </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Potência Máxima: </div>
                        <div> ${cpu.power} W </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Número de Núcleos: </div>
                        <div> ${cpu.cores} Cores </div>                   
                    </div>
                    <hr class="underline-hr">
                </div>
            </li>
        `;
    }

    let list = '';
    parameters.computer.cpus.forEach((element) => {
        list += createLiElement(element);
    });

    document.querySelector('#cpus ul').innerHTML = list;
}

/**
 * Função que constroi a lista de detalhes das GPUs e insere a lista no DOM
 */
function buildGpuDetails() {
    let createLiElement = function(gpu) {
        return `
            <li>
                <div class="font-weight-bold pb-2"> ${gpu.name} </div>
                <div class="content">
                    <div class="d-flex justify-content-between">
                        <div> Temperatura Máxima: </div>
                        <div> ${gpu.temperature} °C </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Clock Máximo do Núcleo: </div>
                        <div> ${gpu.coreclock} MHz </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Clock Máximo doa Memória: </div>
                        <div> ${gpu.memoryclock} MHz </div>                   
                    </div>
                    <hr class="underline-hr">
                </div>
            </li>
        `;
    }

    let list = '';
    parameters.computer.gpus.forEach((element) => {
        list += createLiElement(element);
    });

    document.querySelector('#gpus ul').innerHTML = list;
}

/**
 * Função que constroi a lista de detalhes da Memória RAM e insere a lista no DOM
 */
function buildRamDetails() {
    let createLiElement = function(ram) {
        return `
            <li>
                <div class="font-weight-bold pb-2 d-flex justify-content-between"> 
                    <div> Memória Total: </div>
                    <div> ${ram.total} GB </div>                   
                </div>
                <hr class="underline-hr">
            </li>
        `;
    }

    let list = '';
    list += createLiElement(parameters.computer.ram);

    document.querySelector('#ram ul').innerHTML = list;
}

/**
 * Função que constroi a lista de detalhes dos Dispositivos de Armazenamento e insere a lista no DOM
 */
function buildStorageDeviceDetails() {
    let createLiElement = function(storagedevice) {
        return `
            <li>
                <div class="font-weight-bold py-2"> ${storagedevice.name} </div>
                <div class="content">
                    <div class="d-flex justify-content-between">
                        <div> Discos Lógicos: </div>
                        <div> ${storagedevice.disks} </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Capacidade: </div>
                        <div> ${storagedevice.size.toFixed(2)} GB </div>                   
                    </div>
                    <hr class="underline-hr">
                </div>
            </li>
        `;
    }

    let list = '';
    parameters.computer.storages.forEach((element) => {
        list += createLiElement(element);
    });

    document.querySelector('#storagedevices ul').innerHTML = list;
}