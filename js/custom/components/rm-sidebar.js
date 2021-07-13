/**
 * Representa a lógica do componente SideBar
 * @module SideBar
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';

/**
 * Constante para acessar a SideBar no DOM
 * @constant {Element}
 */
export const _rmsidebar = document.getElementById('rm-sidebar');

/**
 * Constante para armazenar os parâmetros do componente
 * @constant {Object}
 * @property {boolean} loaded=false Define se a SideBar já finalizou o carregamento (true) ou não (false).
 * @property {boolean} active=true Define se a SideBar está aberta (true) ou fechada (false).
 * @property {Computer[]} computers=[]] Contém uma lista de computadores atualmente carregados.
 * @property {Computer} currentcomputer=null Contém o atual computador selecionado.
 * @property {Object} touch=Object Contém informações sobre o touch em dispositivos mobile
 */
const parameters = {
    loaded: false,
    active: true,
    computers: [],
    currentcomputer: null,
    touch: {
        start_x: 0, 
        start_y: 0, 
        end_x: 0, 
        end_y: 0
    }
}

/**
 * Variável para armezenar o estado anterior dos parâmetros do componente.
 * @constant {Object}
 */
let oldparameters = parameters;

window.addEventListener('resize', configScrollHeight);
document.querySelector('#rm-sidebar .toggler').addEventListener('click', toggleSidebar);
document.querySelector('#rm-sidebar .overlay').addEventListener('click', toggleSidebar);
document.getElementById('listsearch').addEventListener('keyup', filterComputerList);
document.addEventListener('DOMContentLoaded', init);

/**
 * Função que deve ser executada para inicializar o componente
 */
function init() {
    if (WebStorage.getCurrentComputer() === null) {
        toggleSidebar(null, false);
    }
    else {
        updateParameters('loaded', true);
        CustomEvents.triggerEvent(_rmsidebar, CustomEvents.componentloaded, parameters);
    }

    configSwipe();

    configScrollHeight();

    setInterval(getComputers, 1000);
}

/**
 * Configura o Swipe em dispositivos mobile
 */
function configSwipe() {
    if (!isMobile()) {
        return;
    }

    let overlay = _rmsidebar.querySelector('.overlay');
    overlay.addEventListener('touchstart', (event) => {
        let touchinfo = {
            start_x: Math.abs(event.touches[0].clientX), 
            start_y: Math.abs(event.touches[0].clientY), 
            end_x: parameters.touch.end_x, 
            end_y: parameters.touch.end_y
        }        
        updateParameters('touch', touchinfo);
    });
    overlay.addEventListener('touchend', (event) => {
        let touchinfo = {
            start_x: parameters.touch.start_x, 
            start_y: parameters.touch.start_y, 
            end_x: Math.abs(event.changedTouches[0].clientX), 
            end_y: Math.abs(event.changedTouches[0].clientY)
        }        
        updateParameters('touch', touchinfo);
        handleSwipe();
    });
}

/**
 * Verifica se o dispositivo atual é mobile
 * @returns {boolean}
 */
function isMobile() {
    try {
        document.createEvent("touchevent");
        return true;
    } catch (exception) {
        return false
    }
}

/**
 * Ativa ou Desativa a SideBar
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 * @param {boolean} showalert - Define se a SideBar deverá mostrar um alerta caso necessário
 */
function toggleSidebar(event, showalert = true) {
    if (!parameters.loaded && showalert) {
        Swal.fire({
            icon: 'info',
            text: 'Selecione um computador antes de continuar!'
        });
        return;
    }

    _rmsidebar.querySelector('.sidebar').classList.toggle('active');
    _rmsidebar.querySelector('.sidebar').classList.toggle('shadow-3-strong');
    _rmsidebar.querySelector('.toggler').classList.toggle('shadow-3-strong');
    _rmsidebar.querySelector('.fa-arrow-left').classList.toggle('d-none');
    _rmsidebar.querySelector('.fa-arrow-right').classList.toggle('d-none');
    _rmsidebar.querySelector('.overlay').classList.toggle('on');
    _rmsidebar.querySelector('.overlay').classList.toggle('off');
    document.querySelector('main').classList.toggle('lockscroll');

    updateParameters('active', !parameters.active);

    CustomEvents.triggerEvent(_rmsidebar, CustomEvents.sidebartoggled, {active: parameters.active});
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

    CustomEvents.triggerEvent(_rmsidebar, CustomEvents.paramchanged, {parameters: parameters});
}

/**
 * Requisita uma lista de computadores para o servidor através de um serviço HTTP
 */
function getComputers() {
    httpservice.GetComputers().then((response) => {
        if (parameters.computers.length !== oldparameters.computers.length && parameters.loaded) {
            computerlist.innerHTML = '';
            updateParameters('loaded', false);
        }
        if (response === null || response === undefined) {
            updateParameters('computers', []);
        }
        else {
            updateParameters('computers', response);
        }


        if (WebStorage.getCurrentComputer() !== null && parameters.currentcomputer === null) {
            updateParameters('currentcomputer', parameters.computers.find((element) => {
                return element.uuid === WebStorage.getCurrentComputer();
            }));
            CustomEvents.triggerEvent(_rmsidebar, CustomEvents.computerchanged, {currentcomputer: parameters.currentcomputer});
        }

        handleChanges();
    });
}

/**
 * Define o computador atual
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function setCurrentComputer(event) {
    const computer = parameters.computers.find((computer) => {
        return computer.name === event.currentTarget.id;
    });

    if (!computer.status) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Esse computador está offline!'
        });
        return;
    }

    WebStorage.setCurrentComputer(computer.uuid);

    if (parameters.currentcomputer !== null) {
        document.getElementById(parameters.currentcomputer.name).classList.remove('active');
    }

    event.currentTarget.classList.toggle('active');

    updateParameters('currentcomputer', computer);
    updateParameters('loaded', true);
    
    CustomEvents.triggerEvent(_rmsidebar, CustomEvents.componentloaded, parameters);
    CustomEvents.triggerEvent(_rmsidebar, CustomEvents.computerchanged, {currentcomputer: parameters.currentcomputer});

    toggleSidebar();
}

/**
 * Interpreta os parâmetros do componente e aplica mudanças caso necessário
 */
function handleChanges() {
    let change = false;

    if (parameters.computers.length === 0) {
        _rmsidebar.querySelector('#sidebar-loading').classList.remove('d-none');
        _rmsidebar.querySelector('#sidebar-computerlist').classList.add('d-none');
    }
    else {
        _rmsidebar.querySelector('#sidebar-loading').classList.add('d-none');
        _rmsidebar.querySelector('#sidebar-computerlist').classList.remove('d-none');
    }

    parameters.computers.forEach((computer, index) => {
        const computerlist = document.querySelector('#sidebar-computerlist ul');

        function getTemplate(computer) {
            return `
            <li id="${computer.name}">
                <a class="d-flex flex-row px-2">
                    <div class="pl-1 pr-2">
                        <i class="fas fa-circle ${computer.status ? 'green-text' : 'red-text'}"></i>
                    </div>
                    ${computer.name}
                </a>
            </li>
            `;
        }

        if (parameters.computers.length !== oldparameters.computers.length && parameters.loaded) {
            computerlist.innerHTML = '';
        }

        if (document.getElementById(computer.name) === null) {
            computerlist.innerHTML += getTemplate(computer);
            change = true;
        }
        else {
            const icon = document.getElementById(computer.name).querySelector('a div i.fa-circle');
            if (icon.classList.contains('red-text') && computer.status) {
                icon.classList.remove('red-text');
                icon.classList.add('green-text');
            }
            else if (icon.classList.contains('green-text') && !computer.status) {
                icon.classList.remove('green-text');
                icon.classList.add('red-text');
            }
        }
    });

    if (change) {
        document.querySelectorAll('#sidebar-computerlist ul li').forEach((element) => {
            if (parameters.currentcomputer !== null) {
                if (parameters.currentcomputer.name === element.id) {
                    element.classList.add('active');
                    updateParameters('loaded', true);
                    CustomEvents.triggerEvent(_rmsidebar, CustomEvents.componentloaded, parameters);
                }
            }
            element.addEventListener('click', setCurrentComputer);
        });
        configScrollHeight();
    }

    oldparameters = parameters;
}

/**
 * Configura a altura do container dos computadores para que o scroll funcione corretamente
 */
function configScrollHeight() {
    const element = document.querySelector('#rm-sidebar .scrollbar');
    const offset = window.innerHeight - element.offsetTop - 66;
    element.setAttribute('style', `height: ${offset}px`);
}

/**
 * Interpreta os eventos de touch que ocorreram.
 */
function handleSwipe() {
	if (((parameters.touch.end_x - parameters.touch.start_x) > 100) && parameters.active) {
        /* DIREITA */
        _rmsidebar.querySelector('.toggler').click();
	}
	else if (((parameters.touch.start_x - parameters.touch.end_x) > 100) && !parameters.active) {
        /* ESQUERDA */
        _rmsidebar.querySelector('.overlay').click();
	}
}

/**
 * Filtra a lista de computadores
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function filterComputerList(event) {
    const element = event.target;
    const value = element.value.toLowerCase();
    document.querySelectorAll('#sidebar-computerlist ul li').forEach((element) => {
        const computer = parameters.computers.find((computer) => {
            return computer.name === element.id;
        });

        if (computer.name.toLowerCase().indexOf(value) > -1) {
            element.classList.remove('d-none');
        }
        else {
            element.classList.add('d-none');
        }
    });
}
