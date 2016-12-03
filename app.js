'use strict';

// Requires for the web interface
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
var routes = require('./routes/routes.js')(app);

// Instantiate the CLI interface
var cli = require('./cli');

// Instantiate the REST server
var server = app.listen(3000, function() {
  console.log('Listening on port 3000...');
});
