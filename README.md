# Fun(ctional)DB (FunDB)

Fun(ctional)DB is an experiment that follows the [Unix philosophy](http://en.wikipedia.org/wiki/Unix_philosophy) (small & specific).
As most database systems in existence are monolithic, both in size and mentailty, this experiments aims at taking the opposite approach.
As such it is not a drop-in replacement for any db system in existence, rather a "new" option to be considered.

tl; dr FunDB is a micro functional programming library performing database functions such 

* querying / filtering
* sorting
* indexing
* searching

or better also, a micro-database that is storage agnostic and client agnostic.


## Overview

The point of FunDB is to extract state from the database as much as possible. You can manage writes to disk outside of FunDB (see an example in test.js) and only perform processing with FunDB.

You can use FunDB in two ways: plain functions or curried around a data collection (which means you do not need to inject your data in the db functions anymore).

## FunDB plain functions

`curry(fun, arg)`: the heart of FunDB is a simple curry function, which takes a function and the first argument of that function. Given a function `f(a, b, c, d)` you can call `curry(f, 'hello')` which returns a function equivalent to `f('hello', b, c, d)`. Note that `curry` only curries one argument at a time (unlike the more advanced curry function in [ramda](http://ramdajs.com/docs/R.html#curry))

`query(filterFun, array)`: this effectively operating a `filter` on the array, and returning a filtered array.

`reduce(reduceFun, array)`: again, operates a native `reduce` on the array, returns the reduced value.

`index(sortFun, array)`: this function returns an object index, which contains a property `ids` which is an array of integers representing the order of the elements in `array` as sorted by the function `sortFun`. So if you have an array of objects, each object containing the property `age`, you could use a sort function like `function (a, b) { return a.age > b.age; }` (which sorts the array elements in ascending age order). Except, the originally array is untouched, while an object `index` is returned. This index object has the following properties:
* `ids`: an array of integer representing the order of elements of the original array if they were to be sorted by `sortFun`
* `first()`: gets the first element in the original array according to `sortFun` (i.e. the object with the lowest age value)
* `last()`: get the last element (i.e. the oldest person in the array)
* `get(position)`: gets the element in the original array corresponding to that position in the index
* `insert(item, pos)`: inserts an element into the original array and updates the index of ids `ids` (*NOTE*: this is the only function with a side effect in that the original array is mutated).

`searchSorted(array, index, item, compareFun)`: this function performs a binary search on `array`, utilising the index object `index`, on an item `item` utilising the (optional) comparison function `compareFun`. `compareFun` only needs to be there in case the concept of `less` or `equal` is not as obvious as comparing numbers or strings (i.e. you may want to compare the length of a string for some). `compareFun` takes two arguments `a` and `b` and compares them, returnning `-1` if a is "less" than b, `0` if the search is a match (and the position in the array will be included in the object returned), and `1` if a is "greater" than b. The function returns an object with two properties: `found` to indicate the item was found and `index` which indicates the position at which the item was found or the position at which the item would be inserted if you were to insert it in the original array. You would use the index method `insert(item, pos)` to operate that.

`and(array, filtersArray)`: this function queries the original array against all the filter functions contained in the array `filtersArray`. Returns an array containing elements that passed all filter tests. Each filter function needs to return a boolean value (true for pass, false for fail). An example usage would be `fundb.and(array, [filterByAgeFunction, filterByLanguageFunction])`.

`or(array, filtersArray)`: like `and` but it performs an `OR` operation between filters and returns an array containing all elements that passed at least one of the filter function tests. Filter function criteria are identical to `and`.

`curryFilter(filterFunction)`: takes a filter function and returns a curried `query` function which can then be called on an array to apply the filter. I.e. `var byAge = function (obj) { return obj.age > 30; }` and then call `byAge(array)` to obtain an array of elements that pass the test. This is a utility method, you could just as easily run `fundb.curry(fundb.query, filterFunction)`.

## Array-centric functions

`FunDB.curry(array)`: this function returns an object with all the above functions as methods (it performs a curry on the array on all those functions and associates them to a single object), except you can skip referencing the data array. So for example after calling: `var db = FunDB.curry(array);` you can then do `db.index(sortFun)` or `db.query(filterFun)` etc.. In summary the object will have the following methods available: 
* `db.query(filterFun)`
* `db.index(sortFun)`
* `db.search(index, item, compareFun)`
* `db.or(filtersArray)`
* `db.and(filtersArray)`
* `db.reduce(reduceFun)`
