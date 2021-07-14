/**
 * Representa a lógica do componente CpuChartsCard
 * @module CpuChartsCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as rmprogressbar from './rm-progressbar.js';
import * as Tools from '../utils/tools.js';
import { _rmsidebar } from './rm-sidebar.js';
import { Processor } from "../models/processor.js";
import { ProcessorReading } from "../models/processor.js";
import ApexCharts from 'apexcharts';
import { Computer } from '../models/computer.js';

/**
 * Constante para acessar a CpuChartsCard no DOM
 * @constant {Element}
 */
export const _rmcpuchartscard = document.getElementById('rm-cpu-charts-card');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o CpuChartsCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o CpuChartsCard está desativado (true) ou ativado (false).
 * @property {number} currentid=0 Define o ID do Processador selecionado atualmente.
 * @property {Processor[]} processors=[]] Representa uma lista de CPUs que o Card poderá mostrar.
 * @property {ProcessorReading} cpureading=CpuReading.empty() Representa a Leitura atual da CPU selecionada
 */
const parameters = {
    loading: false,
    disabled: true,
    currentid: 0,
    processors: [],
    cpureading: ProcessorReading.empty(),
    computer: Computer.empty(),
    readings: {
        processor: {
            load: [],
            temperature: [],
            clock: [],
            power: [],
        }
    }
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

let loadChart = null;
let temperatureChart = null;
let clockChart = null;
let powerChart = null;

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
        _rmcpuchartscard.querySelector('#data').classList.add('d-none');
        _rmcpuchartscard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmcpuchartscard.querySelector('#data').classList.remove('d-none');
        _rmcpuchartscard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmcpuchartscard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmcpuchartscard.querySelector('.card').classList.remove('disabled');
        }  
    }
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {
    switch (event.target.id) {
        case 'rm-sidebar':
            updateParameters('computer', event.detail.currentcomputer);
            updateParameters('processors', event.detail.currentcomputer.processors);
            break;
        default:
            break;
    }

    clearInterval(bgInterval);

    updateParameters('loading', true);
    updateParameters('disabled', false);
    toggleCard();
 
    buildCpuCharts();

    bgInterval = setInterval(getReadings, 2000);
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

    CustomEvents.triggerEvent(_rmcpuchartscard, CustomEvents.cpuchanged);
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

    CustomEvents.triggerEvent(_rmcpuchartscard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados completos de um Computador através de um serviço HTTP e salva apenas as CPUs
 *
function loadCpuCharts() {
    httpservice.GetComputer(WebStorage.getCurrentComputer()).then((response) => {
        updateParameters('processors', response.processors);

        if (parameters.processors.length > 1) {
            function template(cpu) {
                return `
                <div id="cpuid-${cpu.id}" class="dropdown-item">
                    <a class="col-1">#${cpu.id}</a>
                    <a class="col-10 text-truncate">${cpu.name}</a>
                </div>`;
            }

            _rmcpuchartscard.querySelector('.dropdown-menu').innerHTML = '';
            parameters.processors.forEach((cpu) => {
                _rmcpuchartscard.querySelector('.dropdown-menu').innerHTML += template(cpu);
            });
            _rmcpuchartscard.querySelectorAll('.dropdown-item').forEach((element) => {
                element.addEventListener('click', cpuChanged);
            });

            _rmcpuchartscard.querySelector('#selcpu').innerHTML = `#CPU${parameters.currentid}`;
            _rmcpuchartscard.querySelector('button').classList.remove('dropdown-hide');
            _rmcpuchartscard.querySelector('button').classList.add('dropdown-toggle');
            _rmcpuchartscard.querySelector('.dropdown #cpuid').classList.add('d-none');
        }

        let progressbarcontainer = _rmcpuchartscard.querySelector('#rm-progressbar');
        let cpu = parameters.processors[parameters.currentid];
        progressbarcontainer.innerHTML = '';
        progressbarcontainer.innerHTML += rmprogressbar.create('Temperatura', 'temperature', '', 0, '°C', 0, cpu.temperature);
        progressbarcontainer.innerHTML += rmprogressbar.create('Clock', 'clock', '', 0, 'MHz', 0, cpu.clock);
        progressbarcontainer.innerHTML += rmprogressbar.create('Energia', 'power', '', 0, 'W', 0, cpu.power);
            
        _rmcpuchartscard.querySelector('#name').innerHTML = parameters.computer.processors[parameters.currentid].name;

    });
}

/**
 * Requisita ao servidor dados de leitura da CPU do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getReadings() {  
    httpservice.GetComputerReadingRange(parameters.computer.uuid, Date.now, Date.now).then(function (response) {
        let loadReadings = [];
        let temperatureReadings = [];
        let clockReadings = [];
        let powerReadings = [];
        response.forEach((readings) => {
            let processorsReadings = JSON.parse(readings.processors);
            let processorReading = processorsReadings[0];
            let date = new Date(readings.date);
            let load = processorReading.readings.load;
            let temperature = processorReading.readings.temperature;
            let clock = processorReading.readings.clock;
            let power = processorReading.readings.power;
            
            if (date == null || date == undefined || date.isNaN) {
                date = new Date();
            }
            if (load == null || load == undefined || load === 'NaN') {
                load = -1;
            }
            if (temperature == null || temperature == undefined || temperature === 'NaN') {
                temperature = -1;
            }
            if (clock == null || clock == undefined || clock === 'NaN') {
                clock = -1;
            }
            if (power == null || power == undefined || power === 'NaN') {
                power = -1;
            }

            if (load >= 0) {
                loadReadings.push({ x: date, y: load});
            }
            if (temperature >= 0) {
                temperatureReadings.push({ x: date, y: temperature});
            }
            if (clock >= 0) {
                clockReadings.push({ x: date, y: clock});
            }
            if (power >= 0) {
                powerReadings.push({ x: date, y: power});
            }
        });
        
        updateParameters("readings", {
            processor: {
                load: loadReadings,
                temperature: temperatureReadings,
                clock: clockReadings,
                power: powerReadings,
            }
        })

        loadChart.updateSeries([{
            name: 'Uso',
            data: loadReadings
        }], false);    
        temperatureChart.updateSeries([{
            name: 'Temperatura',
            data: temperatureReadings
        }], false);    
        clockChart.updateSeries([{
            name: 'Frequência',
            data: clockReadings
        }], false);    
        powerChart.updateSeries([{
            name: 'Energia',
            data: powerReadings
        }], false);    

        if(parameters.loading) {
            updateParameters('loading', false);
            CustomEvents.triggerEvent(_rmcpuchartscard, CustomEvents.componentloaded, parameters);
            toggleCard();
        }
    });
}

function buildCpuCharts() {
    let getOptions = function (name, title, unity, yLabel, min, max) {
        return {
            series: [{
                name: name,
                data: []
            }],
            stroke: {
                curve: 'straight',
            },
            colors: ['#1e88e5',],
            chart: {
                fontFamily: 'Poppins, sans-serif',
                type: 'area',
                height: 400,
                zoom: {
                    enabled: false,
                },
                animations: {
                    enabled: true,
                },
            },
            dataLabels: {
                enabled: false
            },
            title: {
                text: title,
                align: 'left'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.8,
                    opacityTo: 0,
                    stops: [25, 90, 100],
                }
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val.toFixed(0) + unity;
                    }
                },
                max: max,
                min: min,
                title: {
                    text: yLabel
                }
            },
            xaxis: {
                categories: [],
                tickAmount: 8,
                labels: {
                    formatter: function(value , timestamp, opts) {
                        value = new Date(value);
                        return value.getDate().toString().padStart(2, '0') + '/' + 
                            value.getMonth().toString().padStart(2, '0') + ' ' + 
                            value.getHours().toString().padStart(2, '0') + ':' +
                            value.getMinutes().toString().padStart(2, '0') + ':' +
                            value.getSeconds().toString().padStart(2, '0');
                    }
                }
            },
            tooltip: {
                shared: false,
                y: {
                    formatter: function (val) {
                        return val.toFixed(2) + unity;
                    }
                }
            }
        }
    };

    loadChart = new ApexCharts(
        _rmcpuchartscard.querySelector("#cpu-load-chart"), 
        getOptions('Uso', 'Utilização', ' %', 'Porcentagem', 0, 100)
    );
    temperatureChart = new ApexCharts(
        _rmcpuchartscard.querySelector("#cpu-temperature-chart"), 
        getOptions('Temperatura', 'Temperatura', ' °C', 'Celcius', 0, parameters.processors[parameters.currentid].temperature)
    );
    clockChart = new ApexCharts(
        _rmcpuchartscard.querySelector("#cpu-clock-chart"), 
        getOptions('Frequência', 'Frequência', ' MHz', 'MegaHertz', 0, parameters.processors[parameters.currentid].clock)
    );
    powerChart = new ApexCharts(
        _rmcpuchartscard.querySelector("#cpu-power-chart"), 
        getOptions('Energia', 'Energia', ' W', 'Watts', 0, parameters.processors[parameters.currentid].power)
    );
    loadChart.render();
    temperatureChart.render();
    clockChart.render();
    powerChart.render();
        
    _rmcpuchartscard.querySelector('#name').innerHTML = parameters.computer.processors[parameters.currentid].name;
}