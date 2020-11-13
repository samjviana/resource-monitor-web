/**
 * Representa a lógica do componente Tabs
 * @module Tabs
 */
import { _rmsidebar } from './rm-sidebar.js';
import * as CustomEvents from '../utils/events.js';

/**
 * Constante para acessar as Tabs no DOM
 * @constant {Element}
 */
const _rmtabs = document.getElementById('rm-tabs');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant
 * @property {Computer} currentcomputer=null Contém o atual computador selecionado.
 */
const parameters = {
    currentcomputer: null
}

/**
 * Variável para armezenar o estado anterior dos parâmetros do componente.
 * @constant
 */
let oldparameters = parameters;

_rmsidebar.addEventListener(CustomEvents.computerchanged, (event) => {
    updateParameters('currentcomputer', event.detail.currentcomputer);

    _rmtabs.querySelectorAll('h2').forEach((element) => {
        element.innerHTML = parameters.currentcomputer.name;
    });
});

document.addEventListener('DOMContentLoaded', () => {
});

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

    CustomEvents.triggerEvent(_rmtabs, CustomEvents.paramchanged);
}
