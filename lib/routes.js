'use strict';

var fs = require('fs'),
	r = require('require-tree'),
	get = r('./controllers/api/get'),
    post = r('./controllers/api/post'),
	index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

    var key;

	for (key in get){
		app.get('/api/'+key, get[key]);
	}

    for (key in post){
        app.post('/api/'+key, post[key]);
    }

    // All undefined api routes should return a 404
    app.get('/api/*', function(req, res) {
        res.send(404);
    });
    
    // All other routes to use Angular routing in app/scripts/app.js
    app.get('/partials/*', index.partials);
    app.get('/*', index.index);
};