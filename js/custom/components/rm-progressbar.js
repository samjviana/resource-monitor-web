/**
 * Representa a lógica do componente ProgressBar
 * @module ProgressBar
 */

import * as Tools from '../utils/tools.js';

/**
 * Cria um novo ProgressBar com os parâmetros passados
 * @param {string} label - Representa o Rótulo da Barra de Progresso
 * @param {string} title - Representa o Título Central da Barra de Progresso
 * @param {number} value - Representa o Valor Atual da Barra de Progresso
 * @param {string} unit - Representa a Unidade de Medida da Barra de Progresso
 * @param {number} min - Representa o Valor Mínimo da Barra de Progresso
 * @param {number} max - Representa o Valor Máximo da Barra de Progresso
 * @returns {string}
 */
export function create(label, id, title, value, unit, min, max, classes='') {
    return `
    <div id="${id}" class="my-auto text-center ${classes}">
        <div class="d-flex justify-content-between">
            <small> ${label} </small>
            <small id="title"> ${title} </small>
            <small id="value"> ${value <= 0 ? '-' : value.toFixed(1)} ${unit}</small>
        </div>
        <div class="progress">
            <div class="progress-bar" role="progressbar"
                aria-valuenow="${value}" aria-valuemin="${min}"
                aria-valuemax="${max <= 0 ? 0 : max}"
                style="">
            </div>
        </div>
    </div>`;
}

/**
 * Atualiza o Valor da Barra de Progresso
 * @param {Element} element - Elemento que corresponde à Barra de Progresso que será atualizada
 * @param {number} value - Representa o Valor Atual da Barra de Progresso
 * @param {number} min - Representa o Valor Mínimo da Barra de Progresso 
 * @param {number} max - Representa o Valor Máximo da Barra de Progresso
 * @param {string} unit - Representa a Unidade de Medida da Barra de Progresso
 */
export function update(element, value, min, max, unit) {
    if (value === undefined || value < 0) {
        element.querySelector('#value').innerHTML = '-';
    }
    else {
        element.querySelector('#value').innerHTML = `${value.toFixed(1)} ${unit}`;
    }

    if (value < 0) {
        element.querySelector('.progress-bar').setAttribute('style', '');
    } 
    else if (max === 0) {
        element.querySelector('.progress-bar').setAttribute('style', getNeutralStyle());
    } 
    else {
        element.querySelector('.progress-bar').setAttribute('style', getStyle(value, min, max));
    }
}

/**
 * Retorna o Estilo a ser aplicado na Barra de Progresso
 * @param {number} value - Representa o Valor Atual da Barra de Progresso
 * @param {number} min - Representa o Valor Mínimo da Barra de Progresso 
 * @param {number} max - Representa o Valor Máximo da Barra de Progresso
 * @returns {string}
 */
function getStyle(value, min, max) {
    let percent = Tools.mapValue(value, [min, max], [0, 100]);
    return `
        width: ${percent}%;
        background-color: ${Tools.percentToColor(percent, 100, 0)}
    `;
}

/**
 * Retorna um Estilo Neutro a ser aplicado na Barra de Progresso
 * @param {number} value - Representa o Valor Atual da Barra de Progresso
 * @param {number} min - Representa o Valor Mínimo da Barra de Progresso 
 * @param {number} max - Representa o Valor Máximo da Barra de Progresso
 * @returns {string}
 */
function getNeutralStyle() {
    return `
        width: 100%;
        background-color: #1266f1
    `;
}
