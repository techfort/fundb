'use strict';

var fundb = require('./index'),
	msgpack = require('msgpack5')();

var data = [{
	name: 'joe',
	age: 63,
	lang: 'italian'
}, {
	name: 'john',
	age: 20,
	lang: 'english'
}, {
	name: 'jack',
	age: 33,
	lang: 'irish'
}, {
	name: 'jonas',
	age: 10,
	lang: 'swedish'
}, {
	name: 'jacopo',
	age: 92,
	lang: 'italian'
}];

var FILE = 'test.dat',
	fs = require('fs'),
	ageSort = function (a, b) {
		return a.age > b.age;
	},
	ageIndex,
	ageFilter = fundb.curryFilter(function (obj) {
		return obj.age > 29;
	}),
	byAge = function (obj) {
		return obj.age > 30;
	},
	byName = function (obj) {
		return obj.name === 'joe';
	},
	byLang = function (obj) {
		return obj.lang === 'italian';
	};

console.log('\n=== Create indexes, filters, queries ====\n');
console.log('\n## Create an age index\n', ageIndex = fundb.index(ageSort, data));
console.log('\n## Filter by age\n', ageFilter(data));
console.log('\n## Do a complex query with ANDs and ORs\n', fundb.and(fundb.or(data, [byName, byAge]), [byLang]));

console.log('\n=== Curry FunDB on a data collection ====');
var collDb = fundb.curry(data);
console.log('\n## Testing curried db\n', collDb.query(byAge));
console.log('\n## Testing curried index\n', collDb.index(ageSort));
console.log('\n## Oldest person is ', ageIndex.last());

var newposition;
/*
  search returns an object with two properties: found indicates whether the value was found or not, and position 
  indicates the position at which the item was found or the position it would have if we wanted to insert it.
*/
console.log('\n## Search for someone with age == 39 (fails)\n', newposition = collDb.search(ageIndex, 39, function (a, b) {
	return a < b.age ? -1 : (a > b.age ? 1 : 0);
}));
console.log('... Inserting data and updating the index...');

ageIndex.insert({
	name: 'jill',
	age: 39
}, newposition.index);

console.log('\n## Modified array\n', data, '\n## Modified index:\n', ageIndex);
console.log('\n## Search again (succeeds)\n', collDb.search(ageIndex, 39, function (a, b) {
	return a < b.age ? -1 : (a > b.age ? 1 : 0);
}));

// save to disk with messagepack - just an example.
var writeFile = fundb._(fs.writeFile, FILE),
	writeSuccessful = function (err) {
		if (err) {
			console.log('\n## File ' + FILE + ' not saved');
		}
		console.log('\n## File ' + FILE + ' saved');
	};
writeFile(msgpack.encode(data), writeSuccessful);
fs.unlink('test.dat', function () {
	console.log('\nAll cleaned up!\n----------------\n');
})