/**
 * Representa a lógica do componente ChartsCard
 * @module ChartsCard
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
 * Constante para acessar a ChartsCard no DOM
 * @constant {Element}
 */
export const _rmchartscard = document.getElementById('rm-charts-card');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {boolean} loading=false Define se o ChartsCard já finalizou o carregamento (true) ou não (false).
 * @property {boolean} disabled=true Define se o ChartsCard está desativado (true) ou ativado (false).
 * @property {number} currentcpuid=0 Define o ID do Processador selecionado atualmente.
 * @property {Processor[]} processors=[]] Representa uma lista de CPUs que o Card poderá mostrar.
 * @property {ProcessorReading} cpureading=CpuReading.empty() Representa a Leitura atual da CPU selecionada
 */
const parameters = {
    cards: {
        processor: {
            element: _rmchartscard.querySelector('#cpu-charts-card'),
            loading: false,
            disabled: false,
            currentid: 0,
            charts: {
                load: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                temperature: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                clock: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                power: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
            }
        },
        gpu: {
            element: _rmchartscard.querySelector('#gpu-charts-card'),
            loading: false,
            disabled: false,
            currentid: 0,
            charts: {
                load: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                temperature: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                coreClock: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                memoryClock: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                power: {
                    chart: null,
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
            }
        }
    },
    computer: Computer.empty(),
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

Object.assign(Datepicker.locales, ptBR);

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
    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        console.log(parameters.cards);

        if (parameters.cards[key].loading) {
            parameters.cards[key].element.querySelector('#data').classList.add('d-none');
            parameters.cards[key].element.querySelector('#loader').classList.remove('d-none');
        }
        else {
            parameters.cards[key].element.querySelector('#data').classList.remove('d-none');
            parameters.cards[key].element.querySelector('#loader').classList.add('d-none');
            
            if (parameters.cards[key].disabled) {
                parameters.cards[key].element.querySelector('.card').classList.add('disabled');
            }
            else {
                parameters.cards[key].element.querySelector('.card').classList.remove('disabled');
            }  
        }
    });
}

/**
 * Função para modificar o componente quando o Computador for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function computerChanged(event) {
    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        Object.entries(parameters.cards[key].charts).forEach((_entry) => {
            let _key = _entry[0];
            let _value = _entry[1];

            if (parameters.cards[key].charts[_key].chart != null) {
                parameters.cards[key].charts[_key].chart.destroy();
            }
        });
    });

    switch (event.target.id) {
        case 'rm-sidebar':
            updateParameters('computer', event.detail.currentcomputer);
            break;
        default:
            break;
    }

    clearInterval(bgInterval);

    let cards = parameters.cards;
    Object.entries(cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        cards[key].loading = true;
        cards[key].disabled = false;
    });

    updateParameters('cards', cards);
    toggleCard();
 
    buildCharts();

    bgInterval = setInterval(getReadings, 2000);
}

/**
 * Função para modificar o componente quando a CPU for alterada.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
 function cpuChanged(event) {
    let id = event.currentTarget.id;

    updateParameters('loading', true);
    updateParameters('currentcpuid', id.slice(id.indexOf('-') + 1));
    toggleCard();

    CustomEvents.triggerEvent(_rmchartscard, CustomEvents.cpuchanged);
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

    CustomEvents.triggerEvent(_rmchartscard, CustomEvents.paramchanged);
}

function buildCharts() {
    if (parameters.computer.processors.length > 1) {
        function template(cpu) {
            return `
            <div id="cpuid-${cpu.id}" class="dropdown-item">
                <a class="col-1">#${cpu.id}</a>
                <a class="col-10 text-truncate">${cpu.name}</a>
            </div>`;
        }

        let cpuChart = parameters.cards.processor.element;
        cpuChart.querySelector('.dropdown-menu').innerHTML = '';
        parameters.computer.processors.forEach((cpu) => {
            cpuChart.querySelector('.dropdown-menu').innerHTML += template(cpu);
        });
        cpuChart.querySelectorAll('.dropdown-item').forEach((element) => {
            element.addEventListener('click', cpuChanged);
        });

        cpuChart.querySelector('#selcpu').innerHTML = `#CPU${parameters.cards.processor.currentid}`;
        cpuChart.querySelector('button').classList.remove('dropdown-hide');
        cpuChart.querySelector('button').classList.add('dropdown-toggle');
        cpuChart.querySelector('.dropdown #cpuid').classList.add('d-none');
    }

    Object.entries(parameters.cards).forEach((entry) {
        let key = entry[0];
        let value = entry[1];

        parameters.cards[key].element.innerHTML = '';
        Object.entries(parameters.cards[key].charts).forEach((_entry) => {
            let _key = _entry[0];
            let _value = _entry[1];

            parameters.cards[key].element.appendChild(getChartElement(key, _key));
        });
    });
    let cpuChartDiv = _rmchartscard.querySelector('#cpu-charts');
    cpuChartDiv.innerHTML = '';
    cpuChartDiv.appendChild(getChartElement('cpu', 'load'));
    cpuChartDiv.appendChild(getChartElement('cpu', 'temperature'));
    cpuChartDiv.appendChild(getChartElement('cpu', 'clock'));
    cpuChartDiv.appendChild(getChartElement('cpu', 'power'));

    _rmchartscard.querySelector('.date-range input').addEventListener('focusout', onRangeChange);
    _rmchartscard.querySelectorAll('input[type="checkbox"]').forEach(element => element.addEventListener('click', function(event) { onCheckboxChange(event, element);}));

    cpuLoadRange = new DateRangePicker(_rmchartscard.querySelector('#cpu-load-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    cpuTemperatureRange = new DateRangePicker(_rmchartscard.querySelector('#cpu-temperature-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    cpuClockRange = new DateRangePicker(_rmchartscard.querySelector('#cpu-clock-range'), {
        orientation: 'bottom',
        language: 'pt-BR'
    });
    cpuPowerRange = new DateRangePicker(_rmchartscard.querySelector('#cpu-power-range'), {
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

    cpuLoadChart = new ApexCharts(
        _rmchartscard.querySelector("#cpu-load-chart"), 
        getOptions('Uso', 'Utilização', ' %', 'Porcentagem', 0, 100)
    );
    cpuTemperatureChart = new ApexCharts(
        _rmchartscard.querySelector("#cpu-temperature-chart"), 
        getOptions('Temperatura', 'Temperatura', ' °C', 'Celcius', 0, parameters.processors[parameters.currentcpuid].temperature)
    );
    cpuClockChart = new ApexCharts(
        _rmchartscard.querySelector("#cpu-clock-chart"), 
        getOptions('Frequência', 'Frequência', ' MHz', 'MegaHertz', 0, parameters.processors[parameters.currentcpuid].clock)
    );
    cpuPowerChart = new ApexCharts(
        _rmchartscard.querySelector("#cpu-power-chart"), 
        getOptions('Energia', 'Energia', ' W', 'Watts', 0, parameters.processors[parameters.currentcpuid].power)
    );
    cpuLoadChart.render();
    cpuTemperatureChart.render();
    cpuClockChart.render();
    cpuPowerChart.render();
        
    _rmchartscard.querySelector('#name').innerHTML = parameters.computer.processors[parameters.currentcpuid].name;
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
            let processorReading = processorsReadings[parameters.currentcpuid];
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

        if (parameters.realTimeFlags.processor.load) {
            cpuLoadChart.updateSeries([{
                name: 'Uso',
                data: loadReadings
            }], false);    
        }
        if (parameters.realTimeFlags.processor.temperature) {
            cpuTemperatureChart.updateSeries([{
                name: 'Temperatura',
                data: temperatureReadings
            }], false);    
        }
        if (parameters.realTimeFlags.processor.clock) {
            cpuClockChart.updateSeries([{
                name: 'Frequência',
                data: clockReadings
            }], false);    
        }
        if (parameters.realTimeFlags.processor.power) {
            cpuPowerChart.updateSeries([{
                name: 'Energia',
                data: powerReadings
            }], false);    
        }

        if(parameters.loading) {
            updateParameters('loading', false);
            CustomEvents.triggerEvent(_rmchartscard, CustomEvents.componentloaded, parameters);
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
    else if (element.id.includes('clock')) {
        flags.processor.clock = element.checked;
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