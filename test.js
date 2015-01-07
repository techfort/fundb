'use strict';

var fdb = require('./index'),
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
	lang: 'english'
}, {
	name: 'jim',
	age: 10,
	lang: 'english'
}, {
	name: 'jamess',
	age: 92,
	lang: 'italian'
}];

var FILE = 'test.json',
	fs = require('fs'),
	ageSort = function (a, b) {
		return a.age > b.age;
	},
	ageIndex,
	ageFilter = fdb.curryQuery(function (obj) {
		return obj.age > 29;
	}),
	writeFile = fdb._(fs.writeFile, FILE),

	writeSuccessful = function (err) {
		if (err) {
			console.log('File ' + FILE + ' not saved');
		}
		console.log('File ' + FILE + ' saved\n\n');
	},
	byAge = function (obj) {
		return obj.age > 30;
	},
	byName = function (obj) {
		return obj.name === 'joe';
	},
	byLang = function (obj) {
		return obj.lang === 'italian';
	};

console.log('\nCreate an age index\n', ageIndex = fdb.index(ageSort, data));
console.log('\nFilter by age\n', ageFilter(data));
console.log('\nDo a complex query with ANDs and ORs\n', fdb.and(fdb.or(data, [byName, byAge]), [byLang]));


var collDb = fdb.curry(data);

console.log('Testing curried db\n', collDb.query(byAge));
console.log('Testing curried index\n', collDb.index(ageSort));
console.log('Oldest person is ', ageIndex.last());

var newposition;
/*
  search returns an object with two properties: found indicates whether the value was found or not, and position 
  indicates the position at which the item was found or the position it would have if we wanted to insert it.
*/
console.log('Search\n', newposition = collDb.search(ageIndex, 39, function (a, b) {
	return a < b.age ? -1 : (a > b.age ? 1 : 0);
}));
ageIndex.insert({
	name: 'jill',
	age: 39
}, newposition.index);

console.log('\nModified array and index\n', data, ageIndex);
console.log('Search again\n', collDb.search(ageIndex, 39, function (a, b) {
	return a < b.age ? -1 : (a > b.age ? 1 : 0);
}));


writeFile(msgpack.encode(data), writeSuccessful);