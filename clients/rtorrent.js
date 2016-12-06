'use strict';

var rtorrent = require('node-rtorrent-scgi');
var connections = [];
var config = require('../config.json');

for (var client in config[config.client]) {
  connections.push(rtorrent({ host: 'localhost', port: config[config.clent][client].scgi_port }));
} 

function checkClient () {
  connections.forEach( connection => {
    connection.Details( console.log );
  });
}

setInterval(checkClient, 1000);
