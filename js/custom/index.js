import * as WebStorage from './utils/webstorage.js';

var isLogged = WebStorage.getIsLoggedIn();

if (isLogged === null) {
    window.location.replace(window.origin + '/login.html');
}
else if (isLogged) {
    window.location.replace(window.origin + '/computers.html');
}