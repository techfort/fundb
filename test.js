var fdb = require('./index');

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

var ageIndex = fdb.index(data, function (a, b) {
	return a.age > b.age;
});

console.log(ageIndex);