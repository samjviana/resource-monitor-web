/**
 * Representa a lógica do componente RamCard
 * @module RamCard
 */
import * as CustomEvents from '../utils/events.js';
import * as WebStorage from '../utils/webstorage.js';
import * as httpservice from '../utils/httpservice.js';
import * as Tools from '../utils/tools.js';
import { RAM } from "../models/ram.js";
import { RamReading } from "../models/ram.js";
import { User } from '../models/user.js';

/**
 * Constante para acessar a LoginCard no DOM
 * @constant {Element} 
 */
export const _rmlogincard = document.getElementById('rm-login-card');

/**
 * Constante para armazenar os Parâmetros do Componente
 * @constant {Object}
 * @property {User} user=User.empty() Representa o Usuário que está iniciando uma sessão.
 */
const parameters = {
    user: User.empty(),
    flag: false
}

/**
 * Variável para armezenar o estado anterior dos parâmetros do componente.
 * @constant {Object}
 */
let oldparameters = parameters;

document.addEventListener('DOMContentLoaded', init);
_rmlogincard.querySelector('button').addEventListener('click', doLogin);
_rmlogincard.querySelector('input[type="text"]').addEventListener('keydown', onInputChange);
_rmlogincard.querySelector('input[type="password"]').addEventListener('keydown', onInputChange);

/**
 * Função que deve ser executada para inicializar o componente
 */
function init() {
    console.log(_rmlogincard.querySelector('.needs-validation').querySelector('#username-div').querySelector('input').validity);
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

    CustomEvents.triggerEvent(_rmlogincard, CustomEvents.paramchanged);
}

/**
 * Efetua o login do usuário com os dados informados no formulário.
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function doLogin(event) {
    event.preventDefault();
    event.stopPropagation();    

    let form = _rmlogincard.querySelector('.needs-validation');

    form.querySelector('#username-div').querySelector('.invalid-feedback').innerHTML = 'Digite um nome de Usuário';
    form.querySelector('#password-div').querySelector('.invalid-feedback').innerHTML = 'Digite uma senha';

    if (!form.checkValidity()) {

        if (!form.querySelector('#username-div').querySelector('input').matches(':valid')) {
            form.querySelector('#username-div').classList.add('validation-field');
        }
        if (!form.querySelector('#password-div').querySelector('input').matches(':valid')) {
            form.querySelector('#password-div').classList.add('validation-field');
        }

        form.classList.add('was-validated');
        return;
    }
    form.classList.add('was-validated');

    let user = new User();
    user.username = form.querySelector('#username-div').querySelector('input').value;
    user.password = form.querySelector('#password-div').querySelector('input').value;

    httpservice.DoLogin(user).then(result => {
        if (result.error === 2) {
            form.querySelector('#username-div').querySelector('.invalid-feedback').innerHTML = 'Nome de Usuário não existe';
            form.querySelector('#username-div').querySelector('input').setCustomValidity('invalid');
            form.querySelector('#username-div').classList.add('validation-field');
        }
        else if (result.error === 3) {
            form.querySelector('#password-div').querySelector('.invalid-feedback').innerHTML = 'Senha Incorreta';
            form.querySelector('#password-div').querySelector('input').setCustomValidity('invalid');
            form.querySelector('#password-div').classList.add('validation-field');
        }
        else if (result.error === 0) {
            WebStorage.setIsLoggedIn('true');
            window.location.replace(window.origin + '/computers.html');
        }
    });
}

/**
 * Trata das mudanças que ocorrerem no Input
 * @param {Event} event - Evento ocorrido caso a função seja definida como listener.
 */
function onInputChange(event) {
    event.target.parentElement.classList.remove('validation-field');
    if (event.target.validity.customError === true) {
        event.target.setCustomValidity('');
    }
}