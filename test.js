var fdb = require('./index'),
  msgpack = require('msgpack5')();

var data = [{
  name: 'b',
  age: 10
}, {
  name: 'a',
  age: 20
}, {
  name: 'c',
  age: 30
}, {
  name: 'f',
  age: 100
}, {
  name: 'g',
  age: 50
}];

var FILE = 'test.json',
  fs = require('fs'),
  ageIndex = fdb.index(data, function (a, b) {
    return a.age > b.age;
  }),
  ageFilter = fdb.curryQuery(function (obj) {
    return obj.age > 29;
  }),
  writeFile = fdb.curryWrite(FILE, fs.writeFile),
  writeSuccessful = function (err) {
    if (err) {
      console.log('File ' + FILE + ' not saved');
    }
    console.log('File ' + FILE + ' saved');
  },
  byAge = function (obj) {
    return obj.age > 30;
  },
  byName = function (obj) {
    return obj.name === 'a';
  };

console.log(ageIndex);
console.log(ageFilter(data));
//console.log(fdb.or(data, [byName, byAge]));
writeFile(msgpack.encode(data), writeSuccessful);
var f = fs.createReadStream('./test.json').pipe(msgpack.decode);