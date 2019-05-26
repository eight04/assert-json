const assert = require("assert");
const path = require("path");
const fs = require("fs");

const orderedObject = require("ordered-object");
const parseJSON = require("parse-json");

function cleanPath(file) {
  file = path.resolve(file);
  const relFile = path.relative(".", file);
  if (/^\.{1,2}[\\/]/.test(relFile)) {
    return file;
  }
  return relFile;
}

function deepReplace(o, props) {
  if (
    typeof o === "object" && !Array.isArray(o) &&
    typeof props === "object" && !Array.isArray(props)
  ) {
    const keys = new Set(Object.keys(o).concat(Object.keys(props)));
    for (const k of keys) {
      if (o.hasOwnProperty(k) && props.hasOwnProperty(k)) {
        o[k] = deepReplace(o[k], props[k]);
      } else if (o.hasOwnProperty(k)) {
        delete o[k];
      } else {
        o[k] = props[k];
      }
    }
    return o;
  }
  if (Array.isArray(o) && Array.isArray(props)) {
    o.length = props.length;
    for (let i = 0; i < o.length; i++) {
      o[i] = deepReplace(o[i], props[i]);
    }
    return o;
  }
  return props;
}

function diffJSON(actual, expected, filename) {
  // normalize JSON text
  const expectedObject = orderedObject.wrap(parseJSON(expected, null, filename));
  const expectedText = JSON.stringify(expectedObject, null, 2);
  actual = deepReplace(expectedObject, actual);
  const actualText = JSON.stringify(actual, null, 2);
  
  // diff
  const actualLines = actualText.split("\n");
  const expectedLines = expectedText.split("\n");
  actualLines.length = expectedLines.length = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < actualLines.length; i++) {
    if (actualLines[i] !== expectedLines[i]) {
      return {
        line: i,
        actual: getFrame(actualLines, i),
        expected: getFrame(expectedLines, i)
      };
    }
  }
}

function getFrame(lines, i) {
  return lines.slice(i - 5, i + 5).join("\n");
}

function equal(actual, expected, message = "Actual value doesn't match JSON") {
  const result = diffJSON(actual, expected);
  // console.log(result);
  if (result) {
    fail({
      diff: result,
      message: `${message} at line ${result.line + 1}`,
      stackFn: equal
    });
  }
}

function fail({diff, message, stackFn}) {
  try {
    assert.equal(diff.actual, diff.expected, message);
  } catch (err) {
    Error.captureStackTrace(err, stackFn);
    throw err;
  }
}

function equalFile(actual, expectedFilename, message = "Actual value doesn't match JSON file") {
  const expected = fs.readFileSync(expectedFilename, "utf8");
  const result = diffJSON(actual, expected, expectedFilename);
  if (result) {
    fail({
      diff: result,
      message: `${message} at line ${result.line + 1}\n${" ".repeat(6)}(${cleanPath(expectedFilename)})`,
      stackFn: equalFile
    });
  }
}

module.exports = {equal, equalFile, deepReplace};
