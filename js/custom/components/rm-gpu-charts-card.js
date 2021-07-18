/**
 * Representa a lógica do componente GpuChartsCard
 * @module GpuChartsCard
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
import { DateRangePicker, Datepicker } from 'vanillajs-datepicker';
import ptBR from 'vanillajs-datepicker/locales/pt-BR';
import { GpuReading } from '../models/gpu.js';
import { RAM, RamReading } from '../models/ram.js';
import { StorageReading } from '../models/storage.js';

/**
 * Constante para acessar a GpuChartsCard no DOM
 * @constant {Element}
 */
export const _rmgpuchartscard = document.getElementById('rm-gpu-charts-card');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o GpuChartsCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o GpuChartsCard está desativado (true) ou ativado (false).
 * @property {number} currentgpuid=0 Define o ID do Processador selecionado atualmente.
 * @property {Processor[]} gpus=[]] Representa uma lista de CPUs que o Card poderá mostrar.
 * @property {ProcessorReading} gpureading=CpuReading.empty() Representa a Leitura atual da CPU selecionada
 */
const parameters = {
    loading: false,
    disabled: true,
    currentgpuid: 0,
    gpus: [],
    gpureading: GpuReading.empty(),
    computer: Computer.empty(),
    readings: {
        gpu: {
            load: [],
            temperature: [],
            coreClock: [],
            memoryClock: [],
            power: [],
        },
    },
    realTimeFlags: {
        gpu: {
            load: true,
            temperature: true,
            coreClock: true,
            memoryClock: true,
            power: true,
        },
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

let gpuLoadChart = null;
let gpuTemperatureChart = null;
let gpuCoreClockChart = null;
let gpuMemoryClockChart = null;
let gpuPowerChart = null;

Object.assign(Datepicker.locales, ptBR);

document.addEventListener('DOMContentLoaded', init);
_rmsidebar.addEventListener(CustomEvents.computerchanged, computerChanged);

let gpuLoadRange = null;
let gpuTemperatureRange = null;
let gpuCoreClockRange = null;
let gpuMemoryClockRange = null;
let gpuPowerRange = null;

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
        _rmgpuchartscard.querySelector('#data').classList.add('d-none');
        _rmgpuchartscard.querySelector('#loader').classList.remove('d-none');
    }
    else {
        _rmgpuchartscard.querySelector('#data').classList.remove('d-none');
        _rmgpuchartscard.querySelector('#loader').classList.add('d-none');
        
        if (parameters.disabled) {
            _rmgpuchartscard.querySelector('.card').classList.add('disabled');
        }
        else {
            _rmgpuchartscard.querySelector('.card').classList.remove('disabled');
        }  
    }
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {
    if (gpuLoadChart != null) {
        gpuLoadChart.destroy();
    }
    if (gpuTemperatureChart != null) {
        gpuTemperatureChart.destroy();
    }
    if (gpuCoreClockChart != null) {
        gpuCoreClockChart.destroy();
    }
    if (gpuMemoryClockChart != null) {
        gpuMemoryClockChart.destroy();
    }
    if (gpuPowerChart != null) {
        gpuPowerChart.destroy();
    }

    switch (event.target.id) {
        case 'rm-sidebar':
            updateParameters('computer', event.detail.currentcomputer);
            updateParameters('gpus', event.detail.currentcomputer.gpus);
            break;
        default:
            break;
    }

    clearInterval(bgInterval);

    updateParameters('loading', true);
    updateParameters('disabled', false);
    toggleCard();
 
    buildGpuCharts();

    bgInterval = setInterval(getReadings, 2000);
}

/**
 * Função para modificar o componente quando a GPU for alterada.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
 function gpuChanged(event) {
    let id = event.currentTarget.id;

    updateParameters('loading', true);
    updateParameters('currentgpuid', id.slice(id.indexOf('-') + 1));
    toggleCard();

    CustomEvents.triggerEvent(_rmgpuchartscard, CustomEvents.gpuchanged);
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

    CustomEvents.triggerEvent(_rmgpuchartscard, CustomEvents.paramchanged);
}

/**
 * Requisita ao servidor dados de leitura da CPU do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getReadings() {  
    httpservice.GetComputerReadingRange(parameters.computer.uuid, Date.now, Date.now).then(function (response) {
        let loadReadings = [];
        let temperatureReadings = [];
        let coreClockReadings = [];
        let memoryClockReadings = [];
        let powerReadings = [];
        response.forEach((readings) => {
            let gpusReadings = JSON.parse(readings.gpus);
            let gpuReading = gpusReadings[parameters.currentgpuid];
            let date = new Date(readings.date);
            let load = gpuReading.readings.load;
            let temperature = gpuReading.readings.temperature;
            let coreClock = gpuReading.readings.coreClock;
            let memoryClock = gpuReading.readings.memoryClock;
            let power = gpuReading.readings.power;
            
            if (date == null || date == undefined || date.isNaN) {
                date = new Date();
            }
            if (load == null || load == undefined || load === 'NaN') {
                load = -1;
            }
            if (temperature == null || temperature == undefined || temperature === 'NaN') {
                temperature = -1;
            }
            if (coreClock == null || coreClock == undefined || coreClock === 'NaN') {
                coreClock = -1;
            }
            if (memoryClock == null || memoryClock == undefined || memoryClock === 'NaN') {
                memoryClock = -1;
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
            if (coreClock >= 0) {
                coreClockReadings.push({ x: date, y: coreClock});
            }
            if (memoryClock >= 0) {
                memoryClockReadings.push({ x: date, y: memoryClock});
            }
            if (power >= 0) {
                powerReadings.push({ x: date, y: power});
            }
        });
        
        updateParameters("readings", {
            gpus: {
                load: loadReadings,
                temperature: temperatureReadings,
                coreClock: coreClockReadings,
                memoryClock: memoryClockReadings,
                power: powerReadings,
            }
        })

        if (parameters.realTimeFlags.gpu.load) {
            gpuLoadChart.updateSeries([{
                name: 'Uso',
                data: loadReadings
            }], false);    
        }
        if (parameters.realTimeFlags.gpu.temperature) {
            gpuTemperatureChart.updateSeries([{
                name: 'Temperatura',
                data: temperatureReadings
            }], false);    
        }
        if (parameters.realTimeFlags.gpu.coreClock) {
            gpuCoreClockChart.updateSeries([{
                name: 'Frequência do Núcleo',
                data: coreClockReadings
            }], false);    
        }
        if (parameters.realTimeFlags.gpu.memoryClock) {
            gpuMemoryClockChart.updateSeries([{
                name: 'Frequência da Memória',
                data: memoryClockReadings
            }], false);    
        }
        if (parameters.realTimeFlags.gpu.power) {
            gpuPowerChart.updateSeries([{
                name: 'Energia',
                data: powerReadings
            }], false);    
        }

        if(parameters.loading) {
            updateParameters('loading', false);
            CustomEvents.triggerEvent(_rmgpuchartscard, CustomEvents.componentloaded, parameters);
            toggleCard();
        }
    });
}

function getChartElement(component, type) {
    let element = document.createElement('div');
    element.classList.add('px-2');
    element.innerHTML = `
        <div class="border rounded pt-3 my-2">
            <div class="d-flex justify-content-between px-3 pb-3">
                <div style="align-self: center; width: 40%">
                    <input class="form-check-input mr-2" type="checkbox" value="" id="${component}-${type}-realtime" checked />
                    <label class="form-check-label" style="align-self: center; vertical-align: middle;" for="${component}-${type}-realtime">
                        Tempo Real
                    </label>
                </div>
                <div id="${component}-${type}-range" class="input-group justify-content-end date-range">
                    <div class="form-outline" style="width: 125px">
                        <input type="text" id="${component}-${type}-start" class="form-control datepicker-input" disabled/>
                        <label class="form-label" for="${component}-${type}-start"> Início </label>
                        <div class="form-notch">
                            <div class="form-notch-leading" style="width: 9px"></div>
                            <div class="form-notch-middle" style="width: 8px"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>                                                                                    
                    <span class="input-group-text"> até </span>
                    <div class="form-outline" style="width: 125px">
                        <input type="text" id="${component}-${type}-end" class="form-control" disabled/>
                        <label class="form-label" for="${component}-${type}-end"> Fim </label>
                        <div class="form-notch">
                            <div class="form-notch-leading" style="width: 9px"></div>
                            <div class="form-notch-middle" style="width: 8px"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>  
                    <button class="btn btn-primary shadow-0" type="button" data-mdb-ripple-color="dark" disabled>
                        <i class="fas fa-search"></i>
                    </button>
                </div>  
            </div>
            <div id="${component}-${type}-chart">
            </div>
        </div>
    `;
    return element;
}

function buildGpuCharts() {
    if (parameters.gpus.length > 1) {
        function template(gpu) {
            return `
            <div id="gpuid-${gpu.id}" class="dropdown-item">
                <a class="col-1">#${gpu.id}</a>
                <a class="col-10 text-truncate">${gpu.name}</a>
            </div>`;
        }

        _rmgpuchartscard.querySelector('.dropdown-menu').innerHTML = '';
        parameters.gpus.forEach((gpu) => {
            _rmgpuchartscard.querySelector('.dropdown-menu').innerHTML += template(gpu);
        });
        _rmgpuchartscard.querySelectorAll('.dropdown-item').forEach((element) => {
            element.addEventListener('click', gpuChanged);
        });

        _rmgpuchartscard.querySelector('#selgpu').innerHTML = `#GPU${parameters.currentgpuid}`;
        _rmgpuchartscard.querySelector('button').classList.remove('dropdown-hide');
        _rmgpuchartscard.querySelector('button').classList.add('dropdown-toggle');
        _rmgpuchartscard.querySelector('.dropdown #gpuid').classList.add('d-none');
    }

    let gpuChartDiv = _rmgpuchartscard.querySelector('#gpu-charts');
    gpuChartDiv.innerHTML = '';
    gpuChartDiv.appendChild(getChartElement('gpu', 'load'));
    gpuChartDiv.appendChild(getChartElement('gpu', 'temperature'));
    gpuChartDiv.appendChild(getChartElement('gpu', 'coreClock'));
    gpuChartDiv.appendChild(getChartElement('gpu', 'memoryClock'));
    gpuChartDiv.appendChild(getChartElement('gpu', 'power'));

    _rmgpuchartscard.querySelector('.date-range input').addEventListener('focusout', onRangeChange);
    _rmgpuchartscard.querySelectorAll('input[type="checkbox"]').forEach(element => element.addEventListener('click', function(event) { onCheckboxChange(event, element);}));

    gpuLoadChart = new DateRangePicker(_rmgpuchartscard.querySelector('#gpu-load-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    gpuTemperatureChart = new DateRangePicker(_rmgpuchartscard.querySelector('#gpu-temperature-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    gpuCoreClockChart = new DateRangePicker(_rmgpuchartscard.querySelector('#gpu-coreClock-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    gpuMemoryClockChart = new DateRangePicker(_rmgpuchartscard.querySelector('#gpu-memoryClock-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    gpuPowerChart = new DateRangePicker(_rmgpuchartscard.querySelector('#gpu-power-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });

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

    gpuLoadChart = new ApexCharts(
        _rmgpuchartscard.querySelector("#gpu-load-chart"), 
        getOptions('Uso', 'Utilização', ' %', 'Porcentagem', 0, 100)
    );
    gpuTemperatureChart = new ApexCharts(
        _rmgpuchartscard.querySelector("#gpu-temperature-chart"), 
        getOptions('Temperatura', 'Temperatura', ' °C', 'Celcius', 0, parameters.gpus[parameters.currentgpuid].temperature)
    );
    gpuCoreClockChart = new ApexCharts(
        _rmgpuchartscard.querySelector("#gpu-coreClock-chart"), 
        getOptions('Frequência', 'Frequência', ' MHz', 'MegaHertz', 0, parameters.gpus[parameters.currentgpuid].coreClock)
    );
    gpuMemoryClockChart = new ApexCharts(
        _rmgpuchartscard.querySelector("#gpu-memoryClock-chart"), 
        getOptions('Frequência', 'Frequência', ' MHz', 'MegaHertz', 0, parameters.gpus[parameters.currentgpuid].memoryClock)
    );
    gpuPowerChart = new ApexCharts(
        _rmgpuchartscard.querySelector("#gpu-power-chart"), 
        getOptions('Energia', 'Energia', ' W', 'Watts', 0, parameters.gpus[parameters.currentgpuid].power)
    );
    gpuLoadChart.render();
    gpuTemperatureChart.render();
    gpuCoreClockChart.render();
    gpuMemoryClockChart.render();
    gpuPowerChart.render();
        
    _rmgpuchartscard.querySelector('#name').innerHTML = parameters.computer.gpus[parameters.currentgpuid].name;
}

function onRangeChange(event) {
    if (event.target.value.length > 0) {
        console.log(event.target.parentElement.parentElement.querySelectorAll('input'));
        event.target.parentElement.parentElement.querySelectorAll('input').forEach(element => {
            let label = element.parentElement.querySelector('label');
            element.parentElement.querySelector('.form-notch-middle').style.width = label.clientWidth + 3 + 'px';
            element.classList.add('active');
        });
    }
}

function onCheckboxChange(event, element) {
    let flags = parameters.realTimeFlags;

    if (element.id.includes('load')) {
        flags.processor.load = element.checked;
    }
    else if (element.id.includes('temperature')) {
        flags.processor.temperature = element.checked;
    }
    else if (element.id.includes('coreClock')) {
        flags.processor.coreClock = element.checked;
    }
    else if (element.id.includes('memoryClock')) {
        flags.processor.memoryClock = element.checked;
    }
    else if (element.id.includes('power')) {
        flags.processor.power = element.checked;
    }
    updateParameters('realTimeFlags', flags);

    let dataRange = element.parentElement.parentElement.querySelector('.date-range');
    if (element.checked) {
        dataRange.querySelectorAll('input').forEach(element => element.disabled = true);
        dataRange.querySelector('button').disabled = true;
    }
    else {
        dataRange.querySelectorAll('input').forEach(element => element.disabled = false);
        dataRange.querySelector('button').disabled = false;
    }
}