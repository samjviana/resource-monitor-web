/**
 * Representa a lógica do componente StorageCard
 * @module StorageCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as rmprogressbar from './rm-progressbar.js';
import { _rmsidebar } from './rm-sidebar.js';

/**
 * Constante para acessar a StorageCard no DOM
 * @constant {Element} 
 */
export const _rmstoragecard = document.getElementById('rm-storage-card');

/**
 * Constante para armazenar os Parâmetros do Componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o StorageCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o StorageCard está desativado (true) ou ativado (false).
 * @property {Storage} storages=[]] Representa uma lista de Dispositivos de Armazenamento que o Card irá mostrar.
 * @property {StorageReading} storagereadings=[]] Representa as Leituras atuais dos Dispositivos de Armazenamento
 */
const parameters = {
    loading: false,
    disabled: true,
    storages: [],
    storagereadings: [],
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

/**
 * Função que deve ser executada para inicializar o componente
 */
function init() {
    toggleCard();
}

/**
 * Ativa ou Desativa o Card
 */
function toggleCard() {
    if (parameters.loading) {
        _rmstoragecard.querySelector('#data').classList.add('d-none');
        _rmstoragecard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmstoragecard.querySelector('#data').classList.remove('d-none');
        _rmstoragecard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmstoragecard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmstoragecard.querySelector('.card').classList.remove('disabled');
        }  
    }
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {
    clearInterval(bgInterval);

    updateParameters('loading', true);
    updateParameters('disabled', false);
    toggleCard();
 
    getStorage();

    bgInterval = setInterval(getStorageReading, 1000);
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

    CustomEvents.triggerEvent(_rmstoragecard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados completos de um Computador através de um serviço HTTP e salva apena a RAM
 */
function getStorage() {
    httpservice.GetComputer(WebStorage.getCurrentComputer()).then((response) => {
        updateParameters('storages', response.storages);

        createDeviceCards();
    });
}

/**
 * Cria os Cards dos Dispositivos de Armazenamento
 */
function createDeviceCards() {
    let progressbarcontainer = _rmstoragecard.querySelector('#rm-progressbar');
    progressbarcontainer.innerHTML = '';
    parameters.storages.forEach((storage, index) => {
        let template = `
            <div class="card border ${(index + 1) === parameters.storages.length ? 'mt-1 mb-3' : 'my-1'}">
                <div class="card-body">
                    ${rmprogressbar.create(storage.name, `storage-${storage.id}`, storage.disk, 0, '%', 0, 100)}
                    <small class="d-flex justify-content-between w-100 mt-2">
                        ${rmprogressbar.create('Leitura', `read-${storage.id}`, '', -1, '', 0, storage.read, 'w-100 pr-3 storage')}
                        ${rmprogressbar.create('Escrita', `write-${storage.id}`, '', -1, '', 0, storage.write, 'w-100 pl-3 storage')}
                    </small>
                </div>
            </div>
        `;
        progressbarcontainer.innerHTML += template; 
    });
}

/**
 * Requisita ao servidor dados de leitura da RAM do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getStorageReading() {  
    httpservice.GetStorageReading(WebStorage.getCurrentComputer(), parameters.currentid).then((response) => {
        updateParameters('storagereadings', response);
        
        parameters.storagereadings.forEach((storagereading, id) => {
            rmprogressbar.update(_rmstoragecard.querySelector(`#storage-${id}`), storagereading.usage, 0, 100, '%');
            rmprogressbar.update(_rmstoragecard.querySelector(`#read-${id}`), storagereading.read / 1024, 0, 0, 'GB/s');
            rmprogressbar.update(_rmstoragecard.querySelector(`#write-${id}`), storagereading.write / 1024, 0, 0, 'GB/s');
        });

        if(parameters.loading) {
            updateParameters('loading', false);
            toggleCard();
        }
    });
}

