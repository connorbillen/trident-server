'use strict';

// Requires for the CLI
var stdin   = process.openStdin();
var config  = require('./config.json');
var music   = require('./modules/' + config.music);
var movies  = require('./modules/' + config.movies);
var tvshows = require('./modules/' + config.tvshows);

var activeSelection = '';

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
      activeSelection = args[1];

      directory[args[1]].search(searchText).then( data => {
        callback = question(filter[args[1]](data));         
      });

      break;
    default:
      callback = (callback ? callback(args) : null);
      break;
  }
});

function filterMusic (data) {
  var parsed = {};

  data.forEach( album => {
    if (!parsed[album.artist]) {
      parsed[album.artist] = {};
    }

    album.torrents.forEach( torrent => {
      torrent.Name = torrent.media + ' - ' + torrent.format + ' - ' + torrent.encoding;
    });

    parsed[album.artist][album.name] = album.torrents;
  });

  return parsed;
}

function filterTVShows (data) {
  for (var show in data) {
    for (var season in data[show]) {
      if (typeof data[show][season] === 'string') {
        continue;
      }

      for (var resolution in data[show][season]) {
        if (Array.isArray(data[show][season][resolution])) {
          data[show][season][resolution].forEach( torrent => {
            torrent.Name = resolution + ' - ' + torrent.container + ' - ' + torrent.source;
          });
        }
      }
    }
  }

  return data;
}

function filterMovies (data) {
  var parsed = {};

  data.forEach( movie => {
    if (!parsed[movie.title]) {
      parsed[movie.title] = {};
    }
    
    movie.torrents.forEach(torrent => {
      torrent.Name = torrent.Resolution + ' - ' + torrent.Codec + ' - ' + torrent.Container;
    });

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
      console.log(counter + '. ' + torrent.Name);
      ++counter;
    });

    return (args) => { directory[activeSelection].download(data[parseInt(args[0]) - 1]).then(() => console.log('Download complete')); };
  }
}
