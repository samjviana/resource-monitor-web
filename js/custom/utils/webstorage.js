/**
 * Representa um interface para as tags de armazenamento que são usadas pelo sistema
 * @module WebStorage
 */
import { Computer } from '../models/computer.js';

/**
 * Representa o computador selecionado atualmente no sistema
 * @constant {string}
 */
const currentcomputer = 'currentcomputer';

/**
 * Grava o computador especificado no armazenamento da sessão.
 * @param {string} computername
 */
export function setCurrentComputer(computername) {
    sessionStorage.setItem(currentcomputer, computername);
}

/**
 * Retorna o Computador gravado no armazenamento da sessão
 * @returns {string} Computador gravado no armazenamento da sessão
 */
export function getCurrentComputer() {
    return sessionStorage.getItem(currentcomputer);
}