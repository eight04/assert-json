assert-json
===========

An enhanced assert to diff object with a JSON file. Report line number. It should be useful to spot the error from a large JSON.

Installation
------------

```
npm install -D assert-json
```

Usage
-----

```js
const assertJSON = require("assert-json");

it("my test", () => {
  const someOutput = myFunction(`${__dirname}/testcase/my-test/input.txt`);
  assertJSON.equalFile(someOutput, `${__dirname}/testcase/my-test/result.json`);
});
```

Limitation
----------

This library assumes that the JSON is formatted using 2 space indent i.e.

```js
JSON.stringify(JSON.parse(JSON_CONTENT), null, 2) === JSON_CONTENT
```

In the future, we may try to parse the JSON into an AST to eliminate this limitation. (Currently, we only parse it into an object.)

Changelog
---------

* 0.1.0 (Next)

  - First release.
