assert-json
===========

[![Build Status](https://travis-ci.com/eight04/assert-json.svg?branch=master)](https://travis-ci.com/eight04/assert-json)
[![codecov](https://codecov.io/gh/eight04/assert-json/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/assert-json)

An enhanced assert to diff object with a JSON file. Report line number. It should be useful to spot the error from a large JSON.

![screenshot](https://i.imgur.com/pYmrFBj.png)

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

API
----

This module exports following members:

* `equal`
* `equalFile`

### equal

```js
assertJSON.equal(actual: Any, expectedJSON: String[, message: String]);
```

When `actual` doesn't match `expectedJSON`, an assertion error is raised.

### equalFile

```js
assertJSON.equalFile(actual: Any, expectedJSONFile: String[, message: String]);
```

Like `equal` but the JSON is read from a file. The filename will be included in the error report.

Changelog
---------

* 0.1.3 (May 26, 2019)

  - Fix: broken when the diff is near the top/end.

* 0.1.2 (May 26, 2019)

  - Fix: handle undefined actual.

* 0.1.1 (May 26, 2019)

  - Fix: remove unused files in the package.

* 0.1.0 (May 26, 2019)

  - First release.
