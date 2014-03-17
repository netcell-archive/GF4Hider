var uuid = require('node-uuid'),
    Args = require('args-js'),
    CONST = require('./CONST');

var SessionManager = {};

SessionManager.create = function(propeties, callback, expire) {

    var args = Args([
        {properties: Args.OBJECT   | Args.Optional, _default: {}},
        {expires:    Args.INT      | Args.Optional, _default: CONST.DEFAULT_EXPIRE},
        {callback:   Args.FUNCTION | Args.Optional, _default: function(){}}
    ], arguments);

    // Create new session id
    var id, manager = this;
    while ( this.has( id = uuid.v4() ) ){};

    // Register new session
    var session = this[id] = {
        id:       id,
        expire:   Date.now() + args.expires,
        close:    function() { manager.close(id) },
        running:  false,
        active:   function(){ this.running = true; },
        deactive: function(){ this.running = false; },
        queue:    []
    };

    var properties = args.properties;
    // Write custom properties
    for (var key in propeties) session[key] = propeties[key];

    args.callback(session);

    return id;
};

SessionManager.get = function(id){
    return this[id];
};

SessionManager.close = function(id){
    delete this[id];
};

SessionManager.has = function(id){

    var session = this.get(id);

    if ( session && session.expire > Date.now() ) return true;

    return session = false;
};

module.exports = SessionManager;