/**
 * Representa a lógica do componente CpuCard
 * @module CpuCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as rmprogressbar from './rm-progressbar.js';
import * as Tools from '../utils/tools.js';
import { _rmsidebar } from './rm-sidebar.js';
import { Cpu } from "../models/cpu.js";
import { CpuReading } from '../models/cpureading.js';

/**
 * Constante para acessar a CpuCard no DOM
 * @constant {Element}
 */
export const _rmcpucard = document.getElementById('rm-cpu-card');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o CpuCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o CpuCard está desativado (true) ou ativado (false).
 * @property {number} currentid=0 Define o ID do Processador selecionado atualmente.
 * @property {Cpu[]} cpus=[]] Representa uma lista de CPUs que o Card poderá mostrar.
 * @property {CpuReading} cpureading=CpuReading.empty() Representa a Leitura atual da CPU selecionada
 */
const parameters = {
    loading: false,
    disabled: true,
    currentid: 0,
    cpus: [],
    cpureading: CpuReading.empty(),
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
 * Constante para armazenar um objeto do Gráfico de Uso do Processador
 * @constant {EasyPieChart}
 * @property {string|boolean} scaleColor=false Define a Cor das linhas de escala do gráfico ou as desativa (false)
 * @property {number} lineWidth=13 Define a Espessura da linha do gráfico
 * @property {number} size=150 Define o Tamanho do gráfico
 * @property {string|boolean} trackColor='#e7e8ea' Define a Cor do fundo do gráfico ou o desativa (false)
 * @property {function} onStep=chartOnStep() Define uma Callback a ser executada durante a animação do gráfico
 * @property {string|boolean} barColor=chartBarColor() Define a Cor do gráfico
 * @property {Object} animate={duration:750,enabled:true} Contém as configurações da animação do gráfico
 */
const chart = new EasyPieChart(_rmcpucard.querySelector('.chart'), {
    scaleColor: false,
    lineWidth: 13,
    size: 150,
    trackColor: '#e7e8ea',
    onStep: (from, to, currentvalue) => {
        if (parameters.disabled) {
            _rmcpucard.querySelector('#chart h5').innerHTML = '-';
        }
        else {
            _rmcpucard.querySelector('#chart h5').innerHTML = currentvalue.toFixed(1) + '%';
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
    let progressbarcontainer = _rmcpucard.querySelector('#rm-progressbar');
    progressbarcontainer.innerHTML = '';
    progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', -1, '', 0, 0);
    progressbarcontainer.innerHTML += rmprogressbar.create('Clock', 'clock', '', -1, '', 0, 0);
    progressbarcontainer.innerHTML += rmprogressbar.create('Energia', 'power', '', -1, '', 0, 0);

    toggleCard();
}

/**
 * Ativa ou Desativa o Card
 */
function toggleCard() {
    if (parameters.loading) {
        _rmcpucard.querySelector('#data').classList.add('d-none');
        _rmcpucard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmcpucard.querySelector('#data').classList.remove('d-none');
        _rmcpucard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmcpucard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmcpucard.querySelector('.card').classList.remove('disabled');
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
 
    getCpu();

    bgInterval = setInterval(getCpuReading, 1000);
}

/**
 * Função para modificar o componente quando a CPU for alterada.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function cpuChanged(event) {
    let id = event.currentTarget.id;

    updateParameters('loading', true);
    updateParameters('currentid', id.slice(id.indexOf('-') + 1));
    toggleCard();

    CustomEvents.triggerEvent(_rmcpucard, CustomEvents.cpuchanged);
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

    CustomEvents.triggerEvent(_rmcpucard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados completos de um Computador através de um serviço HTTP e salva apenas as CPUs
 */
function getCpu() {
    httpservice.GetComputer(WebStorage.getCurrentComputer()).then((response) => {
        updateParameters('cpus', response.cpus);

        if (parameters.cpus.length > 1) {
            function template(cpu) {
                return `
                <div id="cpuid-${cpu.id}" class="dropdown-item">
                    <a class="col-1">#${cpu.id}</a>
                    <a class="col-10 text-truncate">${cpu.name}</a>
                </div>`;
            }

            _rmcpucard.querySelector('.dropdown-menu').innerHTML = '';
            parameters.cpus.forEach((cpu) => {
                _rmcpucard.querySelector('.dropdown-menu').innerHTML += template(cpu);
            });
            _rmcpucard.querySelectorAll('.dropdown-item').forEach((element) => {
                element.addEventListener('click', cpuChanged);
            });

            _rmcpucard.querySelector('#selcpu').innerHTML = `#CPU${parameters.currentid}`;
            _rmcpucard.querySelector('button').classList.remove('dropdown-hide');
            _rmcpucard.querySelector('button').classList.add('dropdown-toggle');
            _rmcpucard.querySelector('.dropdown #cpuid').classList.add('d-none');
        }

        let progressbarcontainer = _rmcpucard.querySelector('#rm-progressbar');
        let cpu = parameters.cpus[parameters.currentid];
        progressbarcontainer.innerHTML = '';
        progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', 0, '°C', 0, cpu.temperature);
        progressbarcontainer.innerHTML += rmprogressbar.create('Clock', 'clock', '', 0, 'MHz', 0, cpu.clock);
        progressbarcontainer.innerHTML += rmprogressbar.create('Energia', 'power', '', 0, 'W', 0, cpu.power);
            
        _rmcpucard.querySelector('#name').innerHTML = cpu.name;

    });
}

/**
 * Requisita ao servidor dados de leitura da CPU do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getCpuReading() {  
    httpservice.GetCpuReading(WebStorage.getCurrentComputer(), parameters.currentid).then((response) => {
        updateParameters('cpureading', response);

        chart.update(parameters.cpureading.load);
        _rmcpucard.querySelector('#chart h5').innerHTML = parameters.cpureading.load;

        let cpu = parameters.cpus[parameters.currentid];
        rmprogressbar.update(_rmcpucard.querySelector('#temperature'), parameters.cpureading.temperature, 0, cpu.temperature, '°C');
        rmprogressbar.update(_rmcpucard.querySelector('#clock'), parameters.cpureading.clock, 0, cpu.clock, 'MHz');
        rmprogressbar.update(_rmcpucard.querySelector('#power'), parameters.cpureading.power, 0, cpu.power, 'W');

        if(parameters.loading) {
            chart.update(parameters.cpureading.load);
            updateParameters('loading', false);
            toggleCard();
        }
    });
}

