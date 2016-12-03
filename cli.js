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
};

var filter = {
  "music": filterMusic,
  "movies": filterMovies,
  "tvshows": filterTVShows
}

var callback;

stdin.addListener("data", str => {
  var args;
  var searchText;
  str = str.toString().trim(); 
   
  if (!str.length) {
    console.log('Invalid argument');
    return;
  }

  args = str.split(' ');
  searchText = args.slice(2).join(' ');

  switch (args[0]) {
    case "search":
      directory[args[1]].search(searchText).then( data => {
        callback = question(filter[args[1]](data));         
      });

      break;
    case "add":
      directory[args[1]].search(searchText);
      break;
    case "remove":
      directory[args[1]].search(searchText);
      break;
    default:
      callback = callback(args);
      break;
  }
});

function filterMusic (data) {
  var parsed = {};

  data.forEach( album => {
    if (!parsed[album.artist]) {
      parsed[album.artist] = {};
    }

    parsed[album.artist][album.name] = album.torrents;
  });

  return parsed;
}

function filterTVShows (data) {
  return data;
}

function filterMovies (data) {
  var parsed = {};

  data.forEach( movie => {
    if (!parsed[movie.title]) {
      parsed[movie.title] = {};
    }

    parsed[movie.title] = movie.torrents;
  });

  return parsed;
}

function question (data) {
  if (!Array.isArray(data)) {
    var counter = 1;
    for (var category in data) {
      console.log(counter + '. ' + category);
      ++counter;
    }

    return (args) => { return question(data[Object.keys(data)[parseInt(args[0]) - 1]]); };
  } else {
    var counter = 1;
    data.forEach(torrent => {
      console.log(counter + '. ' + torrent.ReleaseName);
      ++counter;
    });

    return (args) => { console.log(data[parseInt(args[0]) - 1]);  };
  }
}
