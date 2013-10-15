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

f(users.add)
f(users.get)
f(users.exists)
f(users.has)
f(users.remove)
f(users.del)
f(users.count)
f(users.save)
f(users.load)
f(users.destroy)

var add = users.add({username: 'jack'}, er);
eq(add.username, 'jack')
eq(add.id, 1)
ok(add.id)

var get = users.get(add.id, er);
eq(get.username, 'jack')
eq(get.id, add.id)

var set = users.set(get.id, {username: 'john', id: 2}, er);
eq(set.username, 'john')
eq(set.id, 2)

var del = users.del(set.id, er);
eq(del, true)

console.log('test done')
