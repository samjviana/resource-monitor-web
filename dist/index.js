/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/custom/index.js":
/*!****************************!*\
  !*** ./js/custom/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _utils_webstorage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/webstorage.js */ \"./js/custom/utils/webstorage.js\");\n\r\n\r\nvar isLogged = _utils_webstorage_js__WEBPACK_IMPORTED_MODULE_0__.getIsLoggedIn();\r\n\r\nif (isLogged === null) {\r\n    window.location.replace(window.origin + '/login.html');\r\n}\r\nelse if (isLogged) {\r\n    window.location.replace(window.origin + '/computers.html');\r\n}\n\n//# sourceURL=webpack://resourcemonitorweb/./js/custom/index.js?");

/***/ }),

/***/ "./js/custom/utils/webstorage.js":
/*!***************************************!*\
  !*** ./js/custom/utils/webstorage.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"setCurrentComputer\": () => (/* binding */ setCurrentComputer),\n/* harmony export */   \"getCurrentComputer\": () => (/* binding */ getCurrentComputer),\n/* harmony export */   \"setIsLoggedIn\": () => (/* binding */ setIsLoggedIn),\n/* harmony export */   \"getIsLoggedIn\": () => (/* binding */ getIsLoggedIn)\n/* harmony export */ });\n/**\r\n * Representa um interface para as tags de armazenamento que são usadas pelo sistema\r\n * @module WebStorage\r\n */\r\n\r\n/**\r\n * Representa o computador selecionado atualmente no sistema\r\n * @constant {string}\r\n */\r\n const currentcomputer = 'currentcomputer';\r\n const logged = 'logged';\r\n\r\n/**\r\n * Grava o computador especificado no armazenamento da sessão.\r\n * @param {string} computername\r\n */\r\n function setCurrentComputer(computername) {\r\n    sessionStorage.setItem(currentcomputer, computername);\r\n}\r\n\r\n/**\r\n * Retorna o Computador gravado no armazenamento da sessão\r\n * @returns {string} Computador gravado no armazenamento da sessão\r\n */\r\nfunction getCurrentComputer() {\r\n    return sessionStorage.getItem(currentcomputer);\r\n}\r\n\r\n/**\r\n * Grava o usuário logado atualmente no armazenamento da sessão.\r\n * @param {string} isLogged\r\n */\r\n function setIsLoggedIn(isLogged) {\r\n    sessionStorage.setItem(logged, isLogged);\r\n}\r\n\r\n/**\r\n * Retorna se há um usuário logado atualmente no armazenamento da sessão\r\n * @returns {bool} estado de logon armazenado no armazenamento da sessão\r\n */\r\nfunction getIsLoggedIn() {\r\n    return sessionStorage.getItem(logged);\r\n}\n\n//# sourceURL=webpack://resourcemonitorweb/./js/custom/utils/webstorage.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./js/custom/index.js");
/******/ 	
/******/ })()
;