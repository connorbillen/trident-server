'use strict';

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
var routes = require('./routes/routes.js')(app);

var server = app.listen(3000, function() {
  console.log('Listening on port 3000...');
});
