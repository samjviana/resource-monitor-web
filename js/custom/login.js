import { sha256 } from 'js-sha256';
import './components/rm-login-card.js';
import { User } from './models/user.js';
import * as httpservice from './utils/httpservice.js';
import * as WebStorage from './utils/webstorage.js';

var isLogged = WebStorage.getIsLoggedIn();

if (isLogged) {
    window.location.replace(window.origin + '/computers.html');
}/*
var password = 'mudar@123';

var encoder = new TextEncoder();
var data = encoder.encode(password);
var hash = crypto.subtle.digest('SHA-256', data).then(result => {
    let hashArray = Array.from(new Uint8Array(result));
    let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
});*/

