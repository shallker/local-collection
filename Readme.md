
# local-collection

  Records collection in local storage


## Installation

  Install with [component(1)](http://component.io):

    $ component install shallker/local-collection

## Quick Start
```javascript
var LocalCollection = require('local-collection');
var users = new LocalCollection('users');

users.load();

var user = users.add({username: 'jack'});
```

## API
### collection
#### .has(Mix id)
#### .exists(Mix id)
#### .add(Object record, Function onError)
#### .get(Mix id, Function onError)
#### .set(Mix id, Object data, Function onError)
#### .update(Mix id, Object data, Function onError)
#### .del(Mix id, Function onError)
#### .remove(Mix id, Function onError)
#### .count()
#### .save()
#### .load()
#### .destroy()


## Test
  http://shallker.github.io/local-collection/test   


## License

  MIT
