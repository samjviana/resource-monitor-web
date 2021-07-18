const path = require('path');
  
module.exports = {
    entry: {
        computers: './js/custom/computers.js',
        login: './js/custom/login.js',
        index: './js/custom/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    mode: 'development',
    watch: true
};