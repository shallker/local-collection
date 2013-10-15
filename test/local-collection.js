var er = function (m) {throw new Error(m)},
    ok = function (x) {if (!x) throw new Error(x + ' is not ok'); return 1;},
    eq = function (x, y) {if (x !== y) er(x + ' not equal ' + y); return 1;},
    mc = function(ox, oy) {for (var i in ox) {if (!eq(ox[i], oy[i])) er(ox[i] + ' not match ' + oy[i])}}
    s = function (x) {eq(Object.prototype.toString.call(x), '[object String]')},
    f = function (x) {eq(Object.prototype.toString.call(x), '[object Function]')},
    a = function (x) {eq(Object.prototype.toString.call(x), '[object Array]')},
    b = function (x) {eq(Object.prototype.toString.call(x), '[object Boolean]')},
    o = function (x) {eq(Object.prototype.toString.call(x), '[object Object]')},
    log = function () {console.log.apply(console, arguments)};

var LocalCollection = require('local-collection');

var users = new LocalCollection('users');

f(users.add);
f(users.get);
f(users.exists);
f(users.has);
f(users.remove);
f(users.del);
f(users.count);
f(users.save);
f(users.load);
f(users.clear);
f(users.first);
f(users.last);
f(users.item);
f(users.each);
f(users.one);
f(users.all);

users.clear();

// .add()
(function () {
  var user = users.add({username: 'jack'}, er)

  eq(user.username, 'jack')
  eq(user.id, 1)

  users.clear()
})();

// .first()
(function () {
  users.add({username: 'jack'}, er)

  var first = users.first();

  eq(first.username, 'jack')
  eq(first.id, 1)

  users.clear()
})();

// .last()
(function () {
  users.add({username: 'jack'}, er)

  var last = users.last();

  eq(last.username, 'jack')
  eq(last.id, 1)

  users.clear()
})();

// .get()
(function () {
  var add = users.add({username: 'jack'}, er);
  var get = users.get(add.id, er);

  eq(get.username, 'jack')
  eq(get.id, add.id)

  users.clear()
})();

// .set()
(function () {
  var user = users.add({username: 'jack'}, er);
  var newUser = users.set(user.id, {username: 'john', id: 2}, er);

  eq(newUser.username, 'john')
  eq(newUser.id, 2)

  users.clear()
})();

// .del()
(function () {
  var user = users.add({username: 'jack'}, er);

  eq(users.del(user.id, er), true);
  eq(users.has(user.id), false);
})();

// instance events
(function () {
  var user = users.add({username: 'jack'}, er);

  user.on('update', function () {
    console.log(user, 'on update')
  });

  user.on('remove', function () {
    console.log(user, 'on remove')
  });

  users.set(user.id, {username: 'john'}, er);
  eq(user.username, 'john');

  users.del(user.id, er);
})();

// .one() .all()
(function () {
  users.add({username: 'jack', sex: 'male'});
  users.add({username: 'john', sex: 'male'});

  var one = users.one({sex: 'male'});

  eq(one.username, 'jack')
  eq(one.sex, 'male')

  var all = users.all({sex: 'male'});

  eq(all.length, 2);
  eq(all[0].sex, 'male')
  eq(all[1].sex, 'male')
  eq(all[0].username, 'jack')
  eq(all[1].username, 'john')

  users.clear();
})();

console.log('test done')
