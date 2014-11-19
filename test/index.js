'use strict';
var koa = require('koa');
var request = require('supertest');
var mongo = require('../index');

describe('koa-pooled-mongo', function() {
    it('should successfully insert a doc into mongodb', function (done){
        var app = koa();
        app.use(mongo({
            uri: 'mongodb://127.0.0.1:27017/test',
            max: 100,
            min: 1,
            idleTimeoutMillis: 30000,
            log: false,
            sequenceCollection: 'sequences'
        }));
        app.use(function* (next) {
          var data = yield this.mongo.collection('data');
          this.body = yield data.save({ _id: 1, name: 'koa-pooled-mongo' });
        });
        var server = app.listen();
        
        request(server).get('/')
                    .expect(200)
                    .end(function(err, res) {
                        var results = JSON.parse(res.text);
                        results[0].should.equal(1);
                        server.close();
                        done(err, res);
                    });
    });
});
