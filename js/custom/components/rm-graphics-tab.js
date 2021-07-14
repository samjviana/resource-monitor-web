/**
 * Representa a lógica da Tab de Gráficos
 * @module GraphicsTab
 */

import { _rmsidebar } from './rm-sidebar.js';
import * as CustomEvents from '../utils/events.js';
import { _rmcpucard } from "./rm-cpu-card.js";
import { _rmgpucard } from "./rm-gpu-card.js";
import { _rmramcard } from "./rm-ram-card.js";
import { _rmstoragecard } from "./rm-storage-card.js";
import { Computer } from '../models/computer.js';
import ApexCharts from 'apexcharts';
import { dataSeries, testData } from './data.js';
import * as httpservice from '../utils/httpservice.js';

 /**
  * Constante para acessar a GraphicsTab no DOM
  * @constant {Element}
  */
export const _rmgraphicstab = document.getElementById('rm-graphics-tab');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {Computer} computer=Computer.empty() Representa o Computador selecionado atualmente
 */
const parameters = {
    computer: Computer.empty(),
    currentcpuid: 0,
    charts: {
        processors: [],
        gpus: [],
        ram: [],
        storages: []
    }
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
    switch (event.target.id) {
        case 'rm-sidebar':
            updateParameters('computer', event.detail.currentcomputer);
            break;
        default:
            break;
    }
}

/**
 * Função responsável por aguardar o carregamento dos dados do computador selecionado.
 * Esses dados serão mostrados numa lista gerada a partida da coleta dos mesmo.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener
 */
function dataLoadListener(event) {
}

/**
 * Função responsável por carregar os gráficos
 */
function graphLoader() {

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

    CustomEvents.triggerEvent(_rmgraphicstab, CustomEvents.paramchanged);
}