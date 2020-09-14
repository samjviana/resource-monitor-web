/**
 * Representa os Eventos Personalizados do Sistema
 * @module CustomEvents
 */

/**
 * Usado para detectar quando um parâmetro do componente é alterado
 * @constant {string}
 */
export const paramchanged = 'paramchanged';

/**
 * Usado para detectar quando a Sidebar Abre ou Fecha
 * @constant {string}
 */
export const sidebartoggled = 'sidebartoggled';

/**
 * Usado para detectar quando o Computador selecionado é alterado
 * @constant {string}
 */
export const computerchanged = 'computerchanged';

/**
 * Usado para detectar quando a CPU selecionada é alterada
 * @constant {string}
 */
export const cpuchanged = 'cpuchanged';

/**
 * Usado para detectar quando a GPU selecionada é alterada
 * @constant {string}
 */
export const gpuchanged = 'gpuchanged';

/**
 * Dispara um evento personalizado
 * @param {Element} element - Elemento que irá disparar o evento
 * @param {string} eventname - Nome do evento que será disparado
 * @param {Object} data - Dados que serão inseridos no evento caso necessário
 */
export function triggerEvent(element, eventname, data = {}) {
    const customevent = new CustomEvent(eventname, {'detail': data});
    element.dispatchEvent(customevent);
}

