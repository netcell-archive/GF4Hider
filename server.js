'use strict';
// require('nodetime').profile({
// 	accountKey: '2ef82cccaaecd093016b411c09c7fec4c66e5509', 
// 	appName: 'Node.js Application'
// });
var express = require('express');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();
// Start server
require('./lib/socket')(app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
}));

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Expose app
exports = module.exports = app;