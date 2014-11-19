koa-pooled-mongo
================

Koa-pooled-mongo is a mongodb middleware for koa with support of connection pooling. The idea is inspired by Koa-mongo. But this one uses co-mongo instead of native mongodb lib to support generator-based flow control.

Also some helper methods are added over time. Currently only one method is available.

Helper methods:

* getNextSequence (sequenceName)

### Installation

```
$ npm install koa-pooled-mongo
```

### Usage

```
var mongo = require('koa-pooled-mongo');
app.use(mongo({
    uri: 'mongodb://localhost:27017/test'
});
```

### Options

* uri - the uri of mongodb. This option has the priority over others
* host - the host of mongodb
* port - the port of mongodb
* username - the username of mongodb
* password - the password of mongodb
* sequenceCollection: the collection name of storing sequences

All options of [generic-pool](https://github.com/coopernurse/node-pool) can be passed in along with above options

### Examples

```
var koa = require('koa');
var mongo = require('koa-pooled-mongo');
var app = koa();
app.use(mongo());
app.use(function* (next) {
  var data = yield this.mongo.collection('data');
  var results = yield data.save({ _id: 1, name: 'koa-pooled-mongo' });
  console.log(results);
  var one = yield data.findOne({ _id: 1});
  console.log(one);
});
app.listen();
```

### License
MIT