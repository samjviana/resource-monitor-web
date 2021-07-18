import './components/rm-sidebar.js';
import './components/rm-tabs.js';
import './components/rm-cpu-card.js';
import './components/rm-gpu-card.js';
import './components/rm-ram-card.js';
import './components/rm-storage-card.js';
import './components/rm-details-tab.js';
import './components/rm-graphics-tab.js';
import './components/rm-charts-card.js';
import * as WebStorage from './utils/webstorage.js';

var isLogged = WebStorage.getIsLoggedIn();

if (isLogged === null) {
    window.location.replace(window.location.origin + '/login.html');
}