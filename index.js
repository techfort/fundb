module.exports = (function () {
  var fdb = {};

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

    console.log(copy);
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

  fdb.query = query;
  fdb.reduce = reduce;
  fdb.andTest = andTest;
  fdb.orTest = orTest;
  fdb.fork = fork;
  fdb.index = index;
  fdb.addData = addData;
  return fdb;

})();