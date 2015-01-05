module.exports = (function () {
  var FunDB = {};

  function query(coll, fun) {
    return coll.filter(fun);
  }

  function andTest(coll, filters) {
    var result = coll,
      i = 0,
      len = coll.length;

    for (i; i < len; i += 1) {
      result = query(result, filters[i]);
    }
    return result;
  }

  function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (JSON.stringify(a[i]) === JSON.stringify(a[j]))
          a.splice(j--, 1);
      }
    }

    return a;
  }

  function orTest(coll, filters) {
    var result = [],
      i = 0,
      len = coll.length;

    for (i; i < len; i += 1) {
      result.concat(query(coll, filters[i]));
    }
    return arrayUnique(result);
  }

  function reduce(coll, fun) {
    return coll.reduce(fun);
  }

  function fork(coll) {
    return JSON.parse(JSON.stringify(coll));
  }

  function addTestIndex(obj, i) {
    obj.$tempIndex = i;
  }

  function index(coll, sortFun) {
    var copy = fork(coll),
      index = [];;
    copy.forEach(addTestIndex);

    copy.sort(sortFun);
    copy.forEach(function (elem) {
      index.push(+elem.$tempIndex);
    });
    delete copy;
    return index;
  }

  function addData(data, coll, callback) {
    coll.push(data);
    callback();
  }

  function curryWrite(filename, writeFun) {
    return function (callback) {
      writeFun.apply(null, [filename, callback]);
    }
  }

  function curryData(coll) {
    return function (filter) {
      return query(coll, filter);
    }
  }

  function curryQuery(filter) {
    return function (coll) {
      return query(coll, filter);
    }
  }

  FunDB.query = query;
  FunDB.reduce = reduce;
  FunDB.andTest = andTest;
  FunDB.orTest = orTest;
  FunDB.fork = fork;
  FunDB.index = index;
  FunDB.addData = addData;
  FunDB.curryWrite = curryWrite;
  FunDB.curryQuery = curryQuery;

  return FunDB;

})();