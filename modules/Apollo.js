var https     = require('https');
var http      = require('http');
var request   = require('request');
    request   = request.defaults({jar: true});
var exec      = require('child_process').exec;
var deferred  = require('deferred');
var config    = require('../config.json');


// Login to the Apollo API using the username and password supplied in the config file
var host = config[config.music];

request.post({ url: 'https://apollo.rip/login.php', form: { username: host.username, password: host.password }}, 
  function(err, httpResponse, body) { 
    if (err) {
      console.log(err);
    }

    console.log('logged in to Apollo');
  }
);
/* This is where the download-related 
   functions are. Search functions
   are below this sectioin          */ 

// Exported function that is called as the download endpoint for the BroadcasTheNet module
function downloadAlbum(options) {
  var promise = deferred();

  exec('curl -o "' + host.watch_dir + options.Name + '.torrent" ' +
       '"https://apollo.rip/torrents.php?action=download&id=' + options.Id + '&authkey=' + host.authkey +  '&torrent_pass=' + host.torrent_pass + '"', 
    (error, stdout, stderr) => {
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

// Exported function that is called as the search endpoint for the BroadcasTheNet module
function searchForArtist(artist) {
  var response    = deferred();
   
  request('https://apollo.rip/ajax.php?action=artist&artistname=' + encodeURI(artist), function (error, res, body) {
    if (JSON.parse(body).status == 'failure')
      response.resolve('<p>Search failed: ' + body + '</p>');
    else
      response.resolve(process(artist, body));
  });

  return response.promise;
}

// Convert the returned JSON into a usable, organized structure
function process(artistname, json) {
  var releases = JSON.parse(json).response.torrentgroup;
  var albums = [];
    
  for (var release in releases) {
    releases[release].torrent.forEach(function (torrent) { 
      for (var artist in releases[release].artists) {
        if (releases[release].artists[artist].name.toUpperCase().search(artistname.toUpperCase()) != -1 &&
          releases[release].releaseType == 1) {              
            var newalbum = {
                'name'      : releases[release].groupName.replace(/&amp;/g, '&'),
                'artist'    : releases[release].artists[artist].name,
                'image'     : releases[release].wikiImage,
                'torrents'  : []
            };
            
            releases[release].torrent.forEach(function (torrent) {
                if (config[config.music].formats.indexOf(torrent.format) != -1 &&
                    config[config.music].sources.indexOf(torrent.media) != -1)
                    newalbum.torrents.push(torrent);
            });   
                                   
            albums.forEach(function (album) {
                if (album.name == newalbum.name) 
                    newalbum = null; 
            });
            
            if (newalbum)
                albums.push(newalbum);
        }
      }
    });
  }
  
  return albums;
}

exports.search      = searchForArtist;
exports.download    = downloadAlbum;
