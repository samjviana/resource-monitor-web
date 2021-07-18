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
            disabled: true,
            objects: [],
            currentid: 0,
            charts: {
                load: {
                    element: null,
                    chart: null,
                    name: 'Utilização',
                    symbol: '%',
                    unity: 'Porcentagem',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                temperature: {
                    element: null,
                    chart: null,
                    name: 'Temperatura',
                    symbol: '°C',
                    unity: 'Graus Celcius',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                clock: {
                    element: null,
                    chart: null,
                    name: 'Frequência',
                    symbol: 'MHz',
                    unity: 'Mega Hertz',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                power: {
                    element: null,
                    chart: null,
                    name: 'Energia',
                    symbol: 'W',
                    unity: 'Watts',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
            }
        },
        gpu: {
            element: _rmchartscard.querySelector('#gpu-charts-card'),
            loading: false,
            disabled: true,
            objects: [],
            currentid: 0,
            charts: {
                load: {
                    element: null,
                    chart: null,
                    name: 'Utilização',
                    symbol: '%',
                    unity: 'Porcentagem',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                temperature: {
                    element: null,
                    chart: null,
                    name: 'Temperatura',
                    symbol: '°C',
                    unity: 'Graus Celcius',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                coreClock: {
                    element: null,
                    chart: null,
                    name: 'Frequência do Núcleo',
                    symbol: 'MHz',
                    unity: 'Mega Hertz',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                memoryClock: {
                    element: null,
                    chart: null,
                    name: 'Frequência da Memória',
                    symbol: 'MHz',
                    unity: 'Mega Hertz',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                power: {
                    element: null,
                    chart: null,
                    name: 'Energia',
                    symbol: 'W',
                    unity: 'Watts',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
            }
        },
        ram: {
            element: _rmchartscard.querySelector('#ram-charts-card'),
            loading: false,
            disabled: true,
            objects: [],
            currentid: 0,
            charts: {
                load: {
                    element: null,
                    chart: null,
                    name: 'Utilização',
                    symbol: '%',
                    unity: 'Porcentagem',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                }
            }
        },
        storage : {
            element: _rmchartscard.querySelector('#storage-charts-card'),
            loading: false,
            disabled: true,
            objects: [],
            currentid: 0,
            charts: {
                load: {
                    element: null,
                    chart: null,
                    name: 'Utilização',
                    symbol: '%',
                    unity: 'Porcentagem',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                read: {
                    element: null,
                    chart: null,
                    name: 'Leitura',
                    symbol: 'MB/s',
                    unity: 'MegaBytes por Segundo',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                },
                write: {
                    element: null,
                    chart: null,
                    name: 'Escrita',
                    symbol: 'MB/s',
                    unity: 'MegaBytes por Segundo',
                    readings: [],
                    realTime: true,
                    dateTimePicker: null
                }
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
    toggleCards();
}

/**
 * Ativa ou Desativa todos os Cards
 */
 function toggleCards() {
    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

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
 * Ativa ou Desativa um card
 */
 function toggleCard(card) {
    if (card.loading) {
        card.element.querySelector('#data').classList.add('d-none');
        card.element.querySelector('#loader').classList.remove('d-none');
    }
    else {
        card.element.querySelector('#data').classList.remove('d-none');
        card.element.querySelector('#loader').classList.add('d-none');
        
        if (card.disabled) {
            card.element.querySelector('.card').classList.add('disabled');
        }
        else {
            card.element.querySelector('.card').classList.remove('disabled');
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
            parameters.cards.processor.objects = event.detail.currentcomputer.processors;
            parameters.cards.gpu.objects = event.detail.currentcomputer.gpus;
            parameters.cards.ram.objects = [event.detail.currentcomputer.ram];
            parameters.cards.storage.objects = event.detail.currentcomputer.storages;
            break;
        default:
            break;
    }
    console.log(parameters.computer);

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

    clearInterval(bgInterval);

    let cards = parameters.cards;
    Object.entries(cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        cards[key].loading = true;
        cards[key].disabled = false;
    });

    updateParameters('cards', cards);
    toggleCards();
 
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
    toggleCards();

    CustomEvents.triggerEvent(_rmchartscard, CustomEvents.cpuchanged);
}

/**
 * Função para modificar o componente quando o Dispositivo de Armazenamento for alterado.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
 function storageChanged(event) {
    let id = event.currentTarget.id;

    parameters.cards.storage.loading = true;

    id = id.slice(id.indexOf('-') + 1);
    let currentid = -1;
    parameters.cards.storage.objects.forEach((storage, index) => {
        if (storage.index == id) {
            currentid = index;
        }
    });

    parameters.cards.storage.currentid = currentid;

    toggleCard(parameters.cards.storage);

    parameters.cards.storage.element.querySelector('#name').innerHTML = parameters.cards.storage.objects[currentid].name;
    parameters.cards.storage.element.querySelector('#selstorage').innerHTML = `#storage${parameters.cards.storage.objects[currentid].index}`;

    CustomEvents.triggerEvent(_rmchartscard, CustomEvents.storagechanged);
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
            <div id="cpuid-${cpu.number}" class="dropdown-item">
                <a class="col-1">#${cpu.number}</a>
                <a class="col-10 text-truncate">${cpu.name}</a>
            </div>`;
        }

        let cpuCard = parameters.cards.processor.element;
        cpuCard.querySelector('.dropdown-menu').innerHTML = '';
        parameters.computer.processors.forEach((cpu) => {
            cpuCard.querySelector('.dropdown-menu').innerHTML += template(cpu);
        });
        cpuCard.querySelectorAll('.dropdown-item').forEach((element) => {
            cpuCard.addEventListener('click', cpuChanged);
        });

        cpuCard.querySelector('#selcpu').innerHTML = `#cpu${parameters.cards.processor.currentid}`;
        cpuCard.querySelector('button').classList.remove('dropdown-hide');
        cpuCard.querySelector('button').classList.add('dropdown-toggle');
        cpuCard.querySelector('.dropdown #cpuid').classList.add('d-none');
    }
    if (parameters.computer.gpus.length > 1) {
        function template(gpu) {
            return `
            <div id="gpuid-${gpu.number}" class="dropdown-item">
                <a class="col-1">#${gpu.number}</a>
                <a class="col-10 text-truncate">${gpu.name}</a>
            </div>`;
        }

        let gpuCard = parameters.cards.gpu.element;
        gpuCard.querySelector('.dropdown-menu').innerHTML = '';
        parameters.computer.gpus.forEach((gpu) => {
            gpuCard.querySelector('.dropdown-menu').innerHTML += template(gpu);
        });
        gpuCard.querySelectorAll('.dropdown-item').forEach((element) => {
            element.addEventListener('click', gpuChanged);
        });

        gpuCard.querySelector('#selgpu').innerHTML = `#gpu${parameters.cards.gpu.currentid}`;
        gpuCard.querySelector('button').classList.remove('dropdown-hide');
        gpuCard.querySelector('button').classList.add('dropdown-toggle');
        gpuCard.querySelector('.dropdown #gpuid').classList.add('d-none');
    }
    if (parameters.computer.storages.length > 1) {
        function template(storage) {
            return `
            <div id="storageid-${storage.index}" class="dropdown-item">
                <a class="col-1">#${storage.index}</a>
                <a class="col-10 text-truncate">${storage.name}</a>
            </div>`;
        }

        let storageCard = parameters.cards.storage.element;
        storageCard.querySelector('.dropdown-menu').innerHTML = '';
        parameters.computer.storages.forEach((storage) => {
            storageCard.querySelector('.dropdown-menu').innerHTML += template(storage);
        });
        storageCard.querySelectorAll('.dropdown-item').forEach((element) => {
            element.addEventListener('click', storageChanged);
        });

        storageCard.querySelector('#selstorage').innerHTML = `#storage${parameters.cards.storage.objects[parameters.cards.storage.currentid].index}`;
        storageCard.querySelector('button').classList.remove('dropdown-hide');
        storageCard.querySelector('button').classList.add('dropdown-toggle');
        storageCard.querySelector('.dropdown #storageid').classList.add('d-none');
    }

    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        parameters.cards[key].element.querySelector(`#${key}-charts`).innerHTML = '';
        Object.entries(parameters.cards[key].charts).forEach((_entry) => {
            let _key = _entry[0];
            let _value = _entry[1];

            parameters.cards[key].element.querySelector(`#${key}-charts`).appendChild(getChartElement(key, _key));
        });
    });

    _rmchartscard.querySelector('.date-range input').addEventListener('focusout', onRangeChange);
    _rmchartscard.querySelectorAll('input[type="checkbox"]').forEach(element => element.addEventListener('click', function(event) { onCheckboxChange(event, element);}));

    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        Object.entries(parameters.cards[key].charts).forEach((_entry) => {
            let _key = _entry[0];
            let _value = _entry[1];

            let min = 0;
            let max = undefined;
            if (_key === 'load') {
                min = 0;
                max = 100;
            }
            else {
                max = parameters.cards[key].objects[parameters.cards[key].currentid][_key];
                max += max * 0.05;
            }
        
            parameters.cards[key].charts[_key].dateTimePicker = new DateRangePicker(
                _rmchartscard.querySelector(`#${key}-${_key}-range`),
                {
                    orientation: 'bottom',
                    language: 'pt-BR'
                }
            );
            parameters.cards[key].charts[_key].chart = new ApexCharts(
                _rmchartscard.querySelector(`#${key}-${_key}-chart`),
                getOptions(
                    parameters.cards[key].charts[_key].name, 
                    parameters.cards[key].charts[_key].symbol, 
                    parameters.cards[key].charts[_key].unity, 
                    min, 
                    max
                )
            );
            parameters.cards[key].charts[_key].chart.render();
            parameters.cards[key].charts[_key].element = parameters.cards[key].element.querySelector(`#${key}-${_key}-chart`);
        });

        if (key !== 'ram') {
            parameters.cards[key].element.querySelector('#name').innerHTML = parameters.cards[key].objects[parameters.cards[key].currentid].name;
        }
    });
}

function getOptions(name, symbol, unity, min, max) {
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
            height: 500,
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
            text: name,
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
                    return val.toFixed(0) + symbol;
                }
            },
            max: max,
            min: min,
            title: {
                text: unity
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
                    return val.toFixed(2) + symbol;
                }
            }
        }
    }
};

/**
 * Requisita ao servidor dados de leitura do Computador selecionado atualmenteatravés de um serviço HTTP
 */
function getReadings() {  
    httpservice.GetComputerReadingRange(parameters.computer.uuid, Date.now, Date.now).then((response) => {
        oldparameters = parameters;

        Object.entries(parameters.cards).forEach((entry) => {
            let key = entry[0];
            let value = entry[1];
    
            Object.entries(parameters.cards[key].charts).forEach((_entry) => {
                let _key = _entry[0];
                let _value = _entry[1];
    
                parameters.cards[key].charts[_key].readings = [];
            });
        });

        response.forEach((readings) => {
            let processorsReadings = JSON.parse(readings.processors);
            let gpusReadings = JSON.parse(readings.gpus);
            let ramReadings = JSON.parse(readings.ram);
            let storagesReadings = JSON.parse(readings.storages);
            let date = new Date(readings.date);

            Object.entries(parameters.cards).forEach((entry) => {
                let key = entry[0];
                let value = entry[1];
        
                Object.entries(parameters.cards[key].charts).forEach((_entry) => {
                    let _key = _entry[0];
                    let _value = _entry[1];
        
                    let reading = undefined;
                    if (key === 'processor') {
                        reading = processorsReadings[parameters.cards[key].currentid].readings[_key];
                    }
                    else if (key === 'gpu') {
                        reading = gpusReadings[parameters.cards[key].currentid].readings[_key];
                    }
                    else if (key === 'ram') {
                        reading = ramReadings.readings[_key];
                    }
                    else if (key === 'storage') {
                        reading = storagesReadings[parameters.cards[key].currentid].readings[_key];
                    }
                    if (!isInvalid(reading)) {
                        parameters.cards[key].charts[_key].readings.push(reading);
                    }
                });
            });
        });
        
        Object.entries(parameters.cards).forEach((entry) => {
            let key = entry[0];
            let value = entry[1];
    
            Object.entries(parameters.cards[key].charts).forEach((_entry) => {
                let _key = _entry[0];
                let _value = _entry[1];
    
                let isVisible = checkVisible(parameters.cards[key].charts[_key].element);
                if (parameters.cards[key].charts[_key].realTime && isVisible) {
                    updateChart(parameters.cards[key].charts[_key].chart, parameters.cards[key].charts[_key].name, parameters.cards[key].charts[_key].readings);
                }
            });

            if (parameters.cards[key].loading) {
                parameters.cards[key].loading = false;
                CustomEvents.triggerEvent(_rmchartscard, CustomEvents.componentloaded, parameters.cards[key]);
                toggleCard(parameters.cards[key]);
            }
        });
    });
}

function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

async function updateChart(chart, name, readings) {
    chart.updateSeries([{
        name: name,
        data: readings
    }], false);
}

function isInvalid(value) {
    if (value == null || value == undefined || value === 'NaN') {
        return true;
    }
    return false;
}

function getChartElement(component, type) {
    let element = document.createElement('div');
    element.classList.add('px-2');
    element.classList.add('col-12');
    if ((component === 'gpu' && type === 'power') || (component === 'ram')) {
        element.classList.add('col-md-12');
    }
    else {
        element.classList.add('col-md-6');
    }
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
        event.target.parentElement.parentElement.querySelectorAll('input').forEach(element => {
            let label = element.parentElement.querySelector('label');
            element.parentElement.querySelector('.form-notch-middle').style.width = label.clientWidth + 3 + 'px';
            element.classList.add('active');
        });
    }
}

function onCheckboxChange(event, element) {
    let flags = parameters.realTimeFlags;

    Object.entries(parameters.cards).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];

        Object.entries(parameters.cards[key].charts).forEach((_entry) => {
            let _key = _entry[0];
            let _value = _entry[1];

            if (element.id.includes(_key)) {
                parameters.cards[key].charts[_key].realTime = element.checked;
            }
        });
    });

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