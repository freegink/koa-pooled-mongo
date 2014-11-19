'use strict';
var comongo = require('co-mongo');
var debug = require('debug')('mongo');
var poolModule = require('generic-pool');


module.exports = function(options) {
    var defaultOptions = {
        uri: null,
        host: 'localhost',
        port: 27017,
        username: null,
        password: null,
        sequenceCollection: 'sequences'
    };
    
    for(var key in options) {
        defaultOptions[key] = options[key];
    }

    var mongoUrl = '';
    if(defaultOptions.uri) {
        mongoUrl = defaultOptions.uri;
    } else {
        if (defaultOptions.user && defaultOptions.pass) {
          mongoUrl = 'mongodb://' + defaultOptions.username + ':' + defaultOptions.password + '@' + defaultOptions.host + ':' + defaultOptions.port;
        } else {
          mongoUrl = 'mongodb://' + defaultOptions.host + ':' + defaultOptions.port;
        }
    }
    
    return function* (next) {
        if (!this.app._mongoPool) {
            debug('Connect: ' + mongoUrl);
            
            var poolOptions = {
                name : 'mongo',
                create : function (callback) {
                    comongo.connect(mongoUrl)(callback);
                },
                destroy : function (client) {
                    if(client) client.close(); 
                }
            };
            
            //copy over options
            for(var key in defaultOptions) {
                var exclusions = ['uri','host','port','username','password','sequenceCollection'];
                if(exclusions.indexOf(key) === -1) {
                    poolOptions[key] = defaultOptions[key];
                }
            }
            
            this.app._mongoPool = poolModule.Pool(poolOptions);
        }
        
        var mongo = this.mongo = yield this.app._mongoPool.acquire;
        
        if (!mongo) {
            this.throw('Failed to acquire one mongo connection');
        }
        
        mongo.getNextSequence = function *(sequenceName) {
            var sequences = yield mongo.collection(defaultOptions.sequenceCollection);
            var results = yield sequences.findAndModify(
              {_id: sequenceName},
              [],
              {$inc: {seq: 1}},
              {upsert: true, new: true}
            );
            return results[0].seq;
        };
        
        
        debug('Acquire one connection');
        
        yield next;
        
        this.app._mongoPool.release(mongo);
        
        debug('Release one connection');
    };
    
};


