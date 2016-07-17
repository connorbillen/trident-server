var https       = require('https');
var http        = require('http');
var request     = require('request');
request     = request.defaults({jar: true});
var exec        = require('child_process').exec;
var deferred    = require('deferred');
var config      = require('../config.json');

// Login to the PassThePopcorn API using the username and password supplied in the config file
var host = config[config.movie];
request.post({ url: 'https://tls.passthepopcorn.me/ajax.php?action=login',
form: { username: host.username,
  password: host.password,
  passkey: host.auth,
  keeplogged: 1
}},
function(err, httpResponse, body) {
  if (err)
  console.log(err);
}
);
/* This is where the download-related
functions are. Search functions
are below this sectioin          */

// Exported function that is called as the download endpoint for the PassThePopcorn module
function downloadMovie(options) {
  var response = deferred();

  exec('curl -o "' + config[config.movies].watch_dir + options.title + '.torrent" "' + options.url + '"',
  function processDownload(error, stdout, stderr) {
    if (error) {
      console.log(stderr);
      return;
    }

    console.log(stdout);
    response.resolve();
  }
);

return response.promise;
}


/* This is where the search related
functions are. Exports are at the
bottom of the file.             */

// Exported function that is called as the search endpoint for the PassThePopcorn module
function searchForMovie(title) {
  var response    = deferred();

  request('https://passthepopcorn.me/torrents.php?searchstr=' + encodeURI(title) + '&json=noredirect', function (error, res, body) {
    console.log(JSON.stringify(JSON.parse(body), null, 3));

    response.resolve(process(JSON.parse(body)));
  });

  return response.promise;
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
      if (config[config.movie].resolutions.indexOf(torrent.Resolution) != -1 &&
      config[config.movie].sources.indexOf(torrent.Source) != -1)
        newmovie.torrents.push(torrent);
    });

    if (newmovie.torrents.length)
      movies.push(newmovie);
  });

  return movies;
}

exports.search      = searchForMovie;
exports.download    = downloadMovie;
