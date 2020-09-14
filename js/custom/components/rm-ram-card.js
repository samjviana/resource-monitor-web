/**
 * Representa a lógica do componente RamCard
 * @module RamCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as Tools from '../utils/tools.js';
import { _rmsidebar } from './rm-sidebar.js';
import { Ram } from "../models/ram.js";
import { RamReading } from '../models/ramreading.js';

/**
 * Constante para acessar a RamCard no DOM
 * @constant {Element} 
 */
export const _rmramcard = document.getElementById('rm-ram-card');

/**
 * Constante para armazenar os Parâmetros do Componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o RamCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o RamCard está desativado (true) ou ativado (false).
 * @property {Ram} ram=Ram.empty() Representa a Memória RAM que o Card irá mostrar.
 * @property {RamReading} ramreading=RamReading.empty() Representa a Leitura atual da RAM selecionada
 */
const parameters = {
    loading: false,
    disabled: true,
    ram: Ram.empty(),
    ramreading: RamReading.empty(),
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

/**
 * Constante para armazenar um objeto do Gráfico de Uso da Placa de Vídeo
 * @constant {EasyPieChart}
 * @property {string|boolean} scaleColor=false Define a Cor das linhas de escala do gráfico ou as desativa (false)
 * @property {number} lineWidth=13 Define a Espessura da linha do gráfico
 * @property {number} size=150 Define o Tamanho do gráfico
 * @property {string|boolean} trackColor='#e7e8ea' Define a Cor do fundo do gráfico ou o desativa (false)
 * @property {function} onStep=chartOnStep() Define uma Callback a ser executada durante a animação do gráfico
 * @property {string|boolean} barColor=chartBarColor() Define a Cor do gráfico
 * @property {Object} animate={duration:750,enabled:true} Contém as configurações da animação do gráfico
 */
const chart = new EasyPieChart(_rmramcard.querySelector('.chart'), {
    scaleColor: false,
    lineWidth: 13,
    size: 150,
    trackColor: '#e7e8ea',
    onStep: (from, to, currentvalue) => {
        if (parameters.disabled) {
            _rmramcard.querySelector('#chart h5').innerHTML = '-';
        }
        else {
            _rmramcard.querySelector('#chart h5').innerHTML = currentvalue.toFixed(1) + '%';
        }
    },
    barColor: (currentvalue) => chartBarColor(currentvalue),
    animate: {
        duration: 750,
        enabled: true 
    }
});

document.addEventListener('DOMContentLoaded', init);
_rmsidebar.addEventListener(CustomEvents.computerchanged, computerChanged);

/**
 * Retorna a Cor que deverá ser aplicada no gráfico
 * @param {number} currentvalue - Valor atual do gráfico 
 * @returns {string} String representando o valor em Hex do valor passado
 */
function chartBarColor(currentvalue) {
    if (parameters.disabled) {
        return '#e7e8ea';
    }
    return Tools.percentToColor(currentvalue, 100, 0);
}

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
        _rmramcard.querySelector('#data').classList.add('d-none');
        _rmramcard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmramcard.querySelector('#data').classList.remove('d-none');
        _rmramcard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmramcard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmramcard.querySelector('.card').classList.remove('disabled');
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
 
    getRam();

    bgInterval = setInterval(getRamReading, 1000);
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

    CustomEvents.triggerEvent(_rmramcard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados completos de um Computador através de um serviço HTTP e salva apena a RAM
 */
function getRam() {
    httpservice.GetComputer(WebStorage.getCurrentComputer()).then((response) => {
        updateParameters('ram', response.ram);
        
        _rmramcard.querySelector('#totalram').innerHTML = `RAM Total: ${parameters.ram.total} GB`;
        _rmramcard.querySelector('#freeram').innerHTML = 'RAM Livre: -';
        _rmramcard.querySelector('#usedram').innerHTML = 'RAM Usada: -';
    });
}

/**
 * Requisita ao servidor dados de leitura da RAM do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getRamReading() {  
    httpservice.GetRamReading(WebStorage.getCurrentComputer(), parameters.currentid).then((response) => {
        updateParameters('ramreading', response);

        chart.update(parameters.ramreading.load);
        _rmramcard.querySelector('#chart h5').innerHTML = parameters.ramreading.load;

        _rmramcard.querySelector('#freeram').innerHTML = `RAM Livre: ${parameters.ramreading.free.toFixed(2)} GB`;
        _rmramcard.querySelector('#usedram').innerHTML = `RAM Usada: ${parameters.ramreading.used.toFixed(2)} GB`;
        
        if(parameters.loading) {
            chart.update(parameters.ramreading.load);
            updateParameters('loading', false);
            toggleCard();
        }
    });
}

