'use strict';

// Requires for the CLI
var stdin   = process.openStdin();
var config  = require('./config.json');
var music   = require('./modules/' + config.music);
var movies  = require('./modules/' + config.movies);
var tvshows = require('./modules/' + config.tvshows);

var directory = {
  "music": music,
  "movies": movies,
  "tvshows": tvshows
}

stdin.addListener("data", str => {
  var args;
  str = str.toString().trim(); 
   
  if (!str.length) {
    console.log('Invalid argument');
    return;
  }

  args = str.split(' ');
  
  if (!args[1] || !directory[args[1]]) {
    console.log('Invalid media type');
    return;
  }

  var searchText = args.slice(2).join(' ');
  console.log('SEARCH:', searchText);

  switch (args[0]) {
    case "search":
      directory[args[1]].search(searchText).then(console.log);
      break;
    case "add":
      directory[args[1]].search(searchText);
      break;
    case "remove":
      directory[args[1]].search(searchText);
      break;
    default:
      console.log("Invalid action entered");
      break;
  }
});
