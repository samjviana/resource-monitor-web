import { Computer } from "../models/computer.js";
import { CpuReading } from "../models/cpureading.js";

/**
 * Serviço HTTP responsável por se comunicar com o servidor para coletar informações dos computadores.
 * @module HttpService 
 */

/**
 * Endereço do servidor que fornecerá as informações dos computadores
 * @constant {string} 
 */
const url = 'http://samjviana.ddns.net:9002';

/**
 * Opções que serão usadas na requisição HTTP
 * @constant {Object}
 * @property {string} method='GET' Representa o Método que será usado
 * @property {string} redirect='follow' Representa a configuração de Redirecionamento
 */
const options = {
    method: 'GET',
    redirect: 'follow'
}

/**
 * Solicita ao servidor uma lista de computadores conectados ao servidor
 * @returns {Computer[]} Lista de computadores
 */
export function GetComputers() {
    return fetch(`${url}/computador&get&all`, options).then(response => response.json()).catch(error => console.error('GetComputers ERROR: ', error));
}

/**
 * Solicita ao servidor dados de um computador passado como parâmetro
 * @param {string} computername - Nome do computador
 * @returns {Computer} Objeto contendo informações completas do Computador
 */
export function GetComputer(computername) {
    return fetch(`${url}/computer?${computername}`, options).then(response => response.json()).catch(error => console.error('GetComputer ERROR: ', error));
}

/**
 * Solicita ao servidor dados de leitura de uma CPU de um computador passado como parâmetro
 * @param {string} computername - Nome do computador
 * @param {number} cpuid - ID da CPU
 * @returns {CpuReading} Objeto contendo informações de leitura da CPU
 */
export function GetCpuReading(computername, cpuid) {
    return fetch(`${url}/readings?${computername}&cpu&${cpuid}`, options).then(response => response.json()).catch(error => console.error('GetCpuReading ERROR: ', error));
}

/**
 * Solicita ao servidor dados de leitura de uma GPU de um Computador passado como parâmetro
 * @param {string} computername - Nome do Computador
 * @param {number} gpuid - ID da GPU
 * @returns {GpuReading} Objeto contendo informações de leitura da GPU
 */
export function GetGpuReading(computername, gpuid) {
    return fetch(`${url}/readings?${computername}&gpu&${gpuid}`, options).then(response => response.json()).catch(error => console.error('GetGpuReading ERROR: ', error));
}

/**
 * Solicita ao servidor dados de leitura de uma RAM de um Computador passado como parâmetro
 * @param {string} computername - Nome do Computador
 * @returns {RamReading} Objeto contendo informações de leitura da RAM
 */
export function GetRamReading(computername) {
    return fetch(`${url}/readings?${computername}&ram`, options).then(response => response.json()).catch(error => console.error('GetRamReading ERROR: ', error));
}

/**
 * Solicita ao servidor dados de leitura dos Dispositivos de Armazenamento de um Computador passado como parâmetro
 * @param {string} computername - Nome do Computador
 * @returns {StorageReading} Objeto contendo informações de leitura dos Dispositivos de Armazenamento
 */
export function GetStorageReading(computername) {
    return fetch(`${url}/readings?${computername}&hdd`, options).then(response => response.json()).catch(error => console.error('GetStorageReading ERROR: ', error));
}