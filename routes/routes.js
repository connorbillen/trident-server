'use strict';
var config = require('../config.json');
var music = require('../modules/' + config.music);
var movie = require('../modules/' + config.movie);
var tvshow = require('../modules/' + config.tvshow);

var appRouter = function(app) {
  app.post('/search', function(req, res) {
    var data = req.body;

    if (!data.type || !data.query) {
      res.end('Must supply a type and a query');
      console.log(data);
      return;
    }

    var type = data.type;
    var query = data.query;

    if (type === 'Music') music.search(query)(function(response) { res.end(JSON.stringify(response)); });
    if (type === 'Movies') movie.search(query)(function(response) { res.end(JSON.stringify(response)); });
    if (type === 'TV Shows') tvshow.search(query)(function(response) { res.end(JSON.stringify(response)); });
  });
}

module.exports = appRouter;
