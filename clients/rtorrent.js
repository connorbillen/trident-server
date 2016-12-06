'use strict';

var rtorrent = require('node-rtorrent-scgi');
var connections = [];
var config = require('../config.json');

for (var client in config[config.client]) {
  connections.push(rtorrent({ path: config[config.client][client].socket_path }));
} 

function checkClient () {
  connections.forEach( connection => {
    connection.Details( list => { console.log(list); });
  });
}

setInterval(checkClient, 1000);
