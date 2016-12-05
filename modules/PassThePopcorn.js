var https       = require('https');
var http        = require('http');
var request     = require('request');
    request     = request.defaults({jar: true});
var exec        = require('child_process').exec;
var deferred    = require('deferred');
var config      = require('../config.json');

// Login to the PassThePopcorn API using the username and password supplied in the config file
function login() {
  var host = config[config.movies];
  var promise = deferred();

  request.post({  
    url: 'https://passthepopcorn.me/ajax.php?action=login',
      form: { 
        username: host.username,
        password: host.password,
        passkey: host.auth,
        keeplogged: 1
      }
  }, (err, httpResponse, body) => {
    if (err) {
      console.log(err);
      promise.reject();
    }

    promise.resolve();
  });

  return promise.promise;
}
/* This is where the download-related
functions are. Search functions
are below this sectioin          */

// Exported function that is called as the download endpoint for the PassThePopcorn module
function downloadMovie(options) {
  var promise = deferred();

  exec('curl -o "' + config[config.movies].watch_dir + options.Name + '.torrent" ' +  
       '"https://passthepopcorn.me/torrents.php?action=download&id=' + options.Id + '&authkey=' + config[config.movies].authkey + '&torrent_pass=' + config[config.movies].auth + '"',
    function processDownload(error, stdout, stderr) {
      if (error) {
        console.log(stderr);
        return;
      }

      promise.resolve(stdout);
    }
  );

  return promise.promise;
}


/* This is where the search related
functions are. Exports are at the
bottom of the file.             */

// Exported function that is called as the search endpoint for the PassThePopcorn module
function searchForMovie(title) {
  var promise = deferred();

  login().then( () => {
    request('https://tls.passthepopcorn.me/torrents.php?searchstr=' + encodeURI(title) + '&json=noredirect', function (error, res, body) {
      promise.resolve(process(JSON.parse(body)));
    });
  });

  return promise.promise;
}

// Convert the returned JSON into a usable, organized structure
function process(json) {
  var movies = [];

  json.Movies.forEach(function (movie) {
    var newmovie = {
      'title'     : movie.Title,
      'poster'    : movie.Cover,
      'torrents'  : []
    };

    movie.Torrents.forEach(function (torrent) {
      if (config[config.movies].resolutions.indexOf(torrent.Resolution) != -1 &&
      config[config.movies].sources.indexOf(torrent.Source) != -1)
        newmovie.torrents.push(torrent);
    });

    if (newmovie.torrents.length)
      movies.push(newmovie);
  });

  return movies;
}

exports.login       = login;
exports.search      = searchForMovie;
exports.download    = downloadMovie;
