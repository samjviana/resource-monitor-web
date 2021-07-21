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
    _rmdetailstab.getElementsByClassName("collapsible").forEach((element) => {
        element.addEventListener('click', (event) => onHeaderClick(event, element));
    });
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {

}

/**
 * Função para alterar o conteúdo de um grupo de informações quando título for clicado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 * @param {Event} element - Elemento em que o evento ocorreu.
 */
 function onHeaderClick(event, element) {
    element.classList.toggle('active');

    let contentElement = element.nextElementSibling;
    let ulElement = contentElement.firstElementChild;

    if (element.classList.contains('active')) {
        contentElement.style.height = (ulElement.clientHeight + 16) + 'px';
    }
    else {
        contentElement.style.height = '0px';
    }

    /*let contentId = this.nextElementSibling.id;

    var liCount = document.querySelectorAll('#' + current + ' li').length;
    var brCount = document.querySelectorAll('#' + current + ' br').length;
    var trList = document.querySelectorAll('#' + current + ' tr');

    var lineCount = liCount + brCount;
    lineCount *= 19;
    lineCount += 32;
    trList.forEach((tr) => {
    lineCount += tr.clientHeight;
    });

    var height = document.getElementById(current).clientHeight;

    if(height == 0) {
    content.style.height = lineCount + 'px';
    } else {
    content.style.height = '0px';
    }*/
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

    CustomEvents.triggerEvent(_rmdetailstab, CustomEvents.paramchanged);
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

    if (parameters.computer !== null) {
        buildComputerDetails();
        buildOperatingSystemDetails();
        buildCpuDetails();
        buildGpuDetails();
        buildRamDetails();
        buildStorageDeviceDetails();
    }
}

function createInfoRow(label, value) {
    return `
        <div class="d-flex justify-content-between mb-1">
            <div> ${label}: </div>
            <div> ${value} </div>                   
        </div>
        <hr class="underline-hr">
    `;
}

/**
 * Função que constroi a lista de detalhes do Computador e insere a lista no DOM
 */
 function buildComputerDetails() {
    let createLiElement = function(computer) {
        return `
            ${createInfoRow('Nome', computer.name)}
            ${computer.partOfDomain ?
                createInfoRow('Domínio', computer.domain) :
                createInfoRow('Grupo de Trabalho', computer.workGroup)
            }
            ${createInfoRow('Nome no DNS', computer.dnsName)}
            ${createInfoRow('Função', computer.domainRole)}
            ${createInfoRow('Usuário Atual', computer.currentUser)}
            ${createInfoRow('Tipo', computer.computerType)}
            ${createInfoRow('Fabricante', computer.manufacturer)}
            ${createInfoRow('Modelo', computer.model)}
            ${createInfoRow('Estado de Energia', computer.powerState)}
            ${createInfoRow('Contato do Proprietário', computer.ownerContact)}
            ${createInfoRow('Nome do Proprietário', computer.ownerName)}
            ${createInfoRow('Contato do Suporte', computer.supportContact)}
            ${createInfoRow('Tipo de Sistema', computer.systemType)}
            ${createInfoRow('Estado Térmico', computer.thermalState)}
        `;
    };

    let list = createLiElement(parameters.computer);

    _rmdetailstab.querySelector('#computer ul').innerHTML = list;
}

/**
 * Função que constroi a lista de detalhes do Sistema Operacional e insere a lista no DOM
 */
function buildOperatingSystemDetails() {
    let createLiElement = function(operatingsystem) {
        console.log(operatingsystem);
        return `
            ${createInfoRow('Nome', operatingsystem.name)}
            ${createInfoRow('Versão', operatingsystem.version)}
            ${createInfoRow('Build', operatingsystem.build)}
            ${createInfoRow('Fabricante', operatingsystem.manufacturer)}
            ${createInfoRow('Arquitetura', operatingsystem.architecture)}
            ${createInfoRow('Serial Key', operatingsystem.serialKey)}
            ${createInfoRow('Serial Number', operatingsystem.serialNumber)}
            ${createInfoRow('Status', operatingsystem.status)}
            ${createInfoRow('Data de Instalação', operatingsystem.installDate)}
            ${createInfoRow('Linguagem', operatingsystem.language)}
            ${createInfoRow('País', operatingsystem.country)}
            ${createInfoRow('Cógigo de Página', operatingsystem.codePage)}
            ${createInfoRow('Dispositivo de Boot', operatingsystem.bootDevice)}
            ${createInfoRow('Partição do Sistema', operatingsystem.systemPartition)}
            ${createInfoRow('Caminho de Instalação', operatingsystem.installPath)}
        `;
    };

    let list = createLiElement(parameters.computer.operatingSystem);

    _rmdetailstab.querySelector('#operatingsystem ul').innerHTML = list;
}

/**
 * Função que constroi a lista de detalhes das CPUs e insere a lista no DOM
 */
function buildCpuDetails() {
    let createLiElement = function(cpu) {
        return `
            <li>
                <div class="font-weight-bold pb-2"> ${cpu.name} </div>
                <div class="">
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
    parameters.computer.processors.forEach((element) => {
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
                <div class="">
                    <div class="d-flex justify-content-between">
                        <div> Temperatura Máxima: </div>
                        <div> ${gpu.temperature} °C </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Clock Máximo do Núcleo: </div>
                        <div> ${gpu.coreClock} MHz </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Clock Máximo doa Memória: </div>
                        <div> ${gpu.memoryClock} MHz </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Potência Máxima: </div>
                        <div> ${gpu.power} W </div>                   
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
    let createPhysicalMemoryDetails = function(physicalMemories) {
        let physicalMemoryDetails = '';
        physicalMemories.forEach((physicalMemory, idx) => {
            physicalMemoryDetails += `
                <div class="d-flex justify-content-between">
                    <div> Memória Física #${idx}: </div>
                    <div> ${physicalMemory.capacity / 1024} GB </div>
                    </div>
                <hr class="underline-hr">                   
            `;
        });
        return physicalMemoryDetails;
    }
    let createLiElement = function(ram) {
        return `
            <li>
                <div class="font-weight-bold pb-2 d-flex justify-content-between"> 
                    <div> Memória Total: </div>
                    <div> ${ram.total} GB </div>                   
                </div>
                <div class="">
                    ${createPhysicalMemoryDetails(ram.physicalMemories)}
                </div>
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
    let createLiElement = function(storage) {
        return `
            <li>
                <div class="font-weight-bold py-2"> ${storage.name} </div>
                <div class="">
                    <div class="d-flex justify-content-between">
                        <div> Discos Lógicos: </div>
                        <div> ${storage.disks} </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Capacidade: </div>
                        <div> ${storage.size.toFixed(2)} GB </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Velocidade de Leitura: </div>
                        <div> ${storage.read.toFixed(2)} MB/s </div>                   
                    </div>
                    <hr class="underline-hr">
                    <div class="d-flex justify-content-between">
                        <div> Velocidade de Escrita: </div>
                        <div> ${storage.write.toFixed(2)} MB/s </div>                   
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

    document.querySelector('#storages ul').innerHTML = list;
}