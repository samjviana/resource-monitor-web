/**
 * Representa um interface para as tags de armazenamento que são usadas pelo sistema
 * @module WebStorage
 */

/**
 * Representa o computador selecionado atualmente no sistema
 * @constant {string}
 */
 const currentcomputer = 'currentcomputer';
 const logged = 'logged';

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

/**
 * Grava o usuário logado atualmente no armazenamento da sessão.
 * @param {string} isLogged
 */
 export function setIsLoggedIn(isLogged) {
    sessionStorage.setItem(logged, isLogged);
}

/**
 * Retorna se há um usuário logado atualmente no armazenamento da sessão
 * @returns {bool} estado de logon armazenado no armazenamento da sessão
 */
export function getIsLoggedIn() {
    return sessionStorage.getItem(logged);
}