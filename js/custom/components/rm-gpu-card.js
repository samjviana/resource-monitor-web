/**
 * Representa a lógica do componente GpuCard
 * @module GpuCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as rmprogressbar from './rm-progressbar.js';
import * as Tools from '../utils/tools.js';
import { _rmsidebar } from './rm-sidebar.js';
import { Gpu } from "../models/gpu.js";
import { GpuReading } from '../models/gpureading.js';

/**
 * Constante para acessar a GpuCard no DOM
 * @constant {Element} 
 */
export const _rmgpucard = document.getElementById('rm-gpu-card');

/**
 * Constante para armazenar os Parâmetros do Componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o GpuCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o GpuCard está desativado (true) ou ativado (false).
 * @property {number} currentid=0 Define o ID da Placa de Vídeo selecionada atualmente.
 * @property {Gpu[]} gpus=[]] Representa uma lista de GPUs que o Card poderá mostrar.
 * @property {GpuReading} gpureading=GpuReading.empty() Representa a Leitura atual da GPU selecionada
 */
const parameters = {
    loading: false,
    disabled: true,
    currentid: 0,
    gpus: [],
    gpureading: GpuReading.empty(),
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
const chart = new EasyPieChart(_rmgpucard.querySelector('.chart'), {
    scaleColor: false,
    lineWidth: 13,
    size: 150,
    trackColor: '#e7e8ea',
    onStep: (from, to, currentvalue) => {
        if (parameters.disabled) {
            _rmgpucard.querySelector('#chart h5').innerHTML = '-';
        }
        else {
            _rmgpucard.querySelector('#chart h5').innerHTML = currentvalue.toFixed(1) + '%';
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
    let progressbarcontainer = _rmgpucard.querySelector('#rm-progressbar');
    progressbarcontainer.innerHTML = '';
    progressbarcontainer.innerHTML += rmprogressbar.create('Uso Memória', 'memoryload', '', -1, '', 0, 0);
    progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', -1, '', 0, 0);
    progressbarcontainer.innerHTML += rmprogressbar.create('Clock Núcleo', 'coreclock', '', -1, '', 0, 0);
    progressbarcontainer.innerHTML += rmprogressbar.create('Clock Memória', 'memoryclock', '', -1, '', 0, 0);

    toggleCard();
}

/**
 * Ativa ou Desativa o Card
 */
function toggleCard() {
    if (parameters.loading) {
        _rmgpucard.querySelector('#data').classList.add('d-none');
        _rmgpucard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmgpucard.querySelector('#data').classList.remove('d-none');
        _rmgpucard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmgpucard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmgpucard.querySelector('.card').classList.remove('disabled');
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
 
    getGpu();

    bgInterval = setInterval(getGpuReading, 1000);
}

/**
 * Função para modificar o componente quando a GPU for alterada.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function gpuChanged(event) {
    let id = event.currentTarget.id;

    updateParameters('loading', true);
    updateParameters('currentid', id.slice(id.indexOf('-') + 1));
    toggleCard();

    CustomEvents.triggerEvent(_rmgpucard, CustomEvents.gpuchanged);
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

    CustomEvents.triggerEvent(_rmgpucard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados completos de um Computador através de um serviço HTTP e salva apenas as GPUs
 */
function getGpu() {
    httpservice.GetComputer(WebStorage.getCurrentComputer()).then((response) => {
        updateParameters('gpus', response.gpus);

        if (parameters.gpus.length > 1) {
            function template(gpu) {
                return `
                <div id="gpuid-${gpu.id}" class="dropdown-item">
                    <a class="col-1">#${gpu.id}</a>
                    <a class="col-10 text-truncate">${gpu.name}</a>
                </div>`;
            }

            _rmgpucard.querySelector('.dropdown-menu').innerHTML = '';
            parameters.gpus.forEach((gpu) => {
                _rmgpucard.querySelector('.dropdown-menu').innerHTML += template(gpu);
            });
            _rmgpucard.querySelectorAll('.dropdown-item').forEach((element) => {
                element.addEventListener('click', gpuChanged);
            });

            _rmgpucard.querySelector('#selgpu').innerHTML = `#GPU${parameters.currentid}`;
            _rmgpucard.querySelector('button').classList.remove('dropdown-hide');
            _rmgpucard.querySelector('button').classList.add('dropdown-toggle');
            _rmgpucard.querySelector('.dropdown #gpuid').classList.add('d-none');
        }
        else if(parameters.gpus.length <= 0) {
            chart.update(0);
            let progressbarcontainer = _rmgpucard.querySelector('#rm-progressbar');
            progressbarcontainer.innerHTML = '';
            progressbarcontainer.innerHTML += rmprogressbar.create('Uso Memória', 'memoryload', '', -1, '', 0, 0);
            progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', -1, '', 0, 0);
            progressbarcontainer.innerHTML += rmprogressbar.create('Clock Núcleo', 'coreclock', '', -1, '', 0, 0);
            progressbarcontainer.innerHTML += rmprogressbar.create('Clock Memória', 'memoryclock', '', -1, '', 0, 0);
            _rmgpucard.querySelector('#name').innerHTML = '-';

            updateParameters('loading', false);
            updateParameters('disabled', true);
            CustomEvents.triggerEvent(_rmcpucard, CustomEvents.componentloaded, parameters);
            toggleCard();
            clearInterval(bgInterval);
            return;
        }

        let progressbarcontainer = _rmgpucard.querySelector('#rm-progressbar');
        let gpu = parameters.gpus[parameters.currentid];
        progressbarcontainer.innerHTML = '';
        progressbarcontainer.innerHTML += rmprogressbar.create('Uso Memória', 'memoryload', '', 0, '%', 0, gpu.memoryload);
        progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', 0, '°C', 0, gpu.temperature);
        progressbarcontainer.innerHTML += rmprogressbar.create('Clock Núcleo', 'coreclock', '', 0, 'MHz', 0, gpu.coreclock);
        progressbarcontainer.innerHTML += rmprogressbar.create('Clock Memória', 'memoryclock', '', 0, 'MHz', 0, gpu.memoryclock);
            
        _rmgpucard.querySelector('#name').innerHTML = gpu.name;
    });
}

/**
 * Requisita ao servidor dados de leitura da GPU do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getGpuReading() {  
    httpservice.GetGpuReading(WebStorage.getCurrentComputer(), parameters.currentid).then((response) => {
        updateParameters('gpureading', response);

        if(parameters.gpus.length <= 0) {
            updateParameters('disabled', true);
            toggleCard();
            return;
        }
        chart.update(parameters.gpureading.load);
        _rmgpucard.querySelector('#chart h5').innerHTML = parameters.gpureading.load;

        let gpu = parameters.gpus[parameters.currentid];
        rmprogressbar.update(_rmgpucard.querySelector('#memoryload'), parameters.gpureading.memoryload, 0, 100, '%');
        rmprogressbar.update(_rmgpucard.querySelector('#temperature'), parameters.gpureading.temperature, 0, gpu.temperature, '°C');
        rmprogressbar.update(_rmgpucard.querySelector('#coreclock'), parameters.gpureading.coreclock, 0, gpu.coreclock, 'MHz');
        rmprogressbar.update(_rmgpucard.querySelector('#memoryclock'), parameters.gpureading.memoryclock, 0, gpu.memoryclock, 'MHz');

        if(parameters.loading) {
            chart.update(parameters.gpureading.load);
            updateParameters('loading', false);
            CustomEvents.triggerEvent(_rmgpucard, CustomEvents.componentloaded, parameters);
            toggleCard();
        }
    });
}

