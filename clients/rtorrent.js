'use strict';

var rtorrent = require('node-rtorrent-scgi');
var connections = [];
var config = require('../config.json');
var exec = require('child_process').exec;

var processed = {};

for (var client in config[config.client]) {
  var rClient = rtorrent({ path: config[config.client][client].socket_path})
  connections.push({type: client, client: rClient });

  ((rClient, client) => {
    setInterval( () => {
      rClient.Details( list => { process(client, list); }); 
    }, config[config.client][client].interval);
  })(rClient, client);
} 

function process (type, list) {
  if (!processed[type]) {
    console.log('creating library type:', type);
    processed[type] = {};

    list.forEach( torrent => {
      processed[type][torrent.hash] = torrent.complete;
    });
  } else {
    list.forEach( torrent => {
      if (processed[type][torrent.hash] === null) {
        console.log('New torrent detected');
        processed[type][torrent.hash] = torrent.complete;
      } else if (torrent.complete && !processed[type][torrent.hash]) {
        console.log('Torrent download completed');
        processed[type][torrent.hash] = torrent.complete;
        postProcess(torrent, type);
      }
    });
  }
}

function postProcess (torrent, type) {
  if (torrent.directory === torrent.base_path) {
    console.log('Torrent is a directory');
    exec('ln -s ' +  sanitize(torrent.directory) + '/* ' + sanitize(config[config.client][type].post_dir) + '/', (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
        return;
      }

      console.log(stdout);
    });
  } else {
    console.log('Torrent is a file');
    exec('ln -s ' +  sanitize(torrent.base_path) + ' ' + sanitize(config[config.client][type].post_dir) + '/', (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
        return;
      }

      console.log(stdout);
    });
  }
}

function sanitize (string) {
  return string.replace(/ /g, '\\ ')
               .replace(/\[/g, '\\[')
               .replace(/\]/g, '\\]')
               .replace(/\(/g, '\\(')
               .replace(/\)/g, '\\)');
}

console.log('Starting post processor and scanner...');
