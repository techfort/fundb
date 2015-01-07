/**-----------------------------------------------------
 *
 * `7MM"""YMM                       `7MM"""Yb. `7MM"""Yp,
 *   MM    `7                         MM    `Yb. MM    Yb
 *   MM   d `7MM  `7MM  `7MMpMMMb.    MM     `Mb MM    dP
 *   MM""MM   MM    MM    MM    MM    MM      MM MM"""bg.
 *   MM   Y   MM    MM    MM    MM    MM     ,MP MM    `Y
 *   MM       MM    MM    MM    MM    MM    ,dP' MM    ,9
 * .JMML.     `Mbod"YML..JMML  JMML..JMMmmmdP' .JMMmmmd9
 *
 * A tiny Functional Programming library that works
 * like a database that supports (and|or) queries, sorting and indexing
 *
 * @author joe minichino <joe.minichino@gmail.com>
 *
 * ------------------------------------------------------*/

module.exports = (function () {

  function curry() {
    var fun = arguments[0],
      arg = arguments[1];
    return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(arg);
      return fun.apply(null, args);
    }
  }

  function query(fun, coll) {
    return coll.filter(fun);
  }

  function iquery(coll, fun) {
    return query(fun, coll);
  }

  function andTest(coll, filters) {
    var result = fork(coll),
      i = 0,
      len = filters.length;

    for (i; i < len; i += 1) {
      result = query(filters[i], result);
    }
    return result;
  }

  function orTest(coll, filters) {
    var result = [],
      i = 0,
      len = filters.length;
    coll.forEach(function (elem) {
      for (i = 0; i < len; i += 1) {
        if (filters[i].apply(null, [elem])) {
          result.push(JSON.parse(JSON.stringify(elem)));
          break;
        }
      }
    });
    return result;
  };

  function reduce(fun, coll) {
    return coll.reduce(fun);
  }

  function ireduce(coll, fun) {
    return reduce(fun, coll);
  }

  function fork(coll) {
    return JSON.parse(JSON.stringify(coll));
  }

  function addTestIndex(obj, i) {
    obj.$tempIndex = i;
  }

  function index(sortFun, coll) {
    var copy = fork(coll),
      index = [];
    copy.forEach(addTestIndex);

    copy.sort(sortFun);
    copy.forEach(function (elem) {
      index.push(+elem.$tempIndex);
    });
    delete copy;
    var i = {};
    i.ids = index;
    i.first = function () {
      return coll[i.ids[0]];
    };
    i.last = function () {
      return coll[i.ids.length - 1];
    };
    i.get = function (pos) {
      return coll[pos];
    };
    i.insert = function (item, pos) {
      coll.push(item);
      i.ids.splice(pos, 0, coll.length - 1);
    };
    return i;
  }

  function iindex(coll, sortFun) {
    return index(sortFun, coll);
  }

  function curryFilter(filter) {
    return function (coll) {
      return query(filter, coll);
    }
  }

  function searchSorted(coll, index, item, fun) {
    var lo = 0,
      hi = coll.length,
      compared,
      mid;
    if (!fun) {
      fun = function (a, b) {
        return (a < b) ? -1 : ((a > b) ? 1 : 0);
      }
    }
    while (lo < hi) {
      mid = ((lo + hi) / 2) | 0;
      compared = fun(item, coll[index.ids[mid]]);
      if (compared == 0) {
        return {
          found: true,
          index: mid
        };
      } else if (compared < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return {
      found: false,
      index: hi
    };
  }

  var FunDB = {};
  FunDB.query = query;
  FunDB.reduce = reduce;
  FunDB.and = andTest;
  FunDB.or = orTest;
  FunDB.fork = fork;
  FunDB.index = index;
  FunDB._ = curry;
  FunDB.curryFilter = curryFilter;
  FunDB.search = searchSorted;
  FunDB.curry = function (coll) {
    var db = {};
    db.query = curry(iquery, coll);
    db.index = curry(iindex, coll);
    db.search = curry(searchSorted, coll);
    db.or = curry(orTest, coll);
    db.and = curry(andTest, coll);
    db.reduce = curry(ireduce, coll);
    return db;
  };

  return FunDB;

})();