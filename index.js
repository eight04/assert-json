const assert = require("assert");
const path = require("path");
const fs = require("fs");

const orderedObject = require("ordered-object");
const {default: LinesAndColumns} = require("lines-and-columns");

function parseJSON(json, filename) {
  let pos;
  try {
    return JSON.parse(json);
  } catch (err) {
    err.stack = decoPosition(err.stack);
    err.message = decoPosition(err.message);
    if (filename) {
      filename = cleanPath(filename);
      err.stack = decoFilename(err.stack);
      err.message = decoFilename(err.message);
    }
    throw err;
  }
  
  function decoFilename(message) {
    return message.replace(/in JSON/, `in ${filename}`);
  }
  
  function decoPosition(message) {
    return message.replace(/position\s+(\d+)/, (m, index) => {
      if (!pos) {
        pos = new LinesAndColumns(json).locationForIndex(Number(index));
      }
      return `line ${pos.line + 1} col ${pos.column + 1}`;
    });
  }
}

function cleanPath(file) {
  file = path.resolve(file);
  const relFile = path.relative(".", file);
  if (/^\.{1,2}[\\/]/.test(relFile)) {
    return file;
  }
  return relFile;
}

function isObject(o) {
  return o && typeof o === "object" && !Array.isArray(o);
}

function deepReplace(o, props) {
  if (isObject(o) && isObject(props)) {
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
  const expectedObject = orderedObject.wrap(parseJSON(expected, filename));
  const expectedText = JSON.stringify(expectedObject, null, 2);
  actual = deepReplace(expectedObject, actual);
  const actualText = JSON.stringify(actual, null, 2);
  return diffText(actualText, expectedText);
}

function diffText(actualText, expectedText) {
  const actualLines = actualText.split("\n");
  const expectedLines = expectedText.split("\n");
  const maxLength = Math.max(actualLines.length, expectedLines.length);
  for (let i = 0; i < maxLength; i++) {
    if (actualLines[i] !== expectedLines[i]) { // FIXME: prevent out of index?
      return {
        line: i,
        actual: getFrame(actualLines, i),
        expected: getFrame(expectedLines, i)
      };
    }
  }
}

function getFrame(lines, i) {
  return lines.slice(Math.max(i - 5, 0), Math.min(i + 5, lines.length)).join("\n");
}

function equal(actual, expected, message = "Actual value doesn't match JSON") {
  if (actual === undefined) {
    fail({
      message: "Actual value is undefined",
      stackFn: equal
    });
  }
  const result = diffJSON(actual, expected);
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
    if (diff) {
      assert.equal(diff.actual, diff.expected, message);
    } else {
      throw new TypeError(message);
    }
  } catch (err) {
    Error.captureStackTrace(err, stackFn);
    throw err;
  }
}

function equalFile(actual, expectedFilename, message = "Actual value doesn't match JSON file") {
  if (actual === undefined) {
    fail({
      message: "Actual value is undefined",
      stackFn: equalFile
    });
  }
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

module.exports = {equal, equalFile, deepReplace, diffText, parseJSON};
