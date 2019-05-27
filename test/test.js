/* eslint-env mocha */
const assert = require("assert");
const {withDir} = require("tempdir-yaml");

const assertJSON = require("..");

describe("assertJSON", () => {
  it("equal", () => {
    assert.throws(
      () => assertJSON.equal({a: 1}, `
        {
          "a": 3
        }
      `),
      /at line 2/
    );
  });
  
  it("equalFile", () =>
    withDir(`
      - test.json: |
          {
            "a": 3
          }
    `, resolve => {
      assert.throws(
        () => assertJSON.equalFile({a: 1}, resolve("test.json")),
        /at line 2[\s\S]*test\.json/
      );
    })
  );
  
  it("handle undefined actual", () => {
    assert.throws(
      () => assertJSON.equal(undefined, "{}"),
      /actual value is undefined/i
    );
  });
});

describe("deepReplace", () => {
  const deepReplace = assertJSON.deepReplace;
  
  it("replace", () => {
    const o = {a: 1};
    const o2 = deepReplace(o, {a: 2});
    assert.equal(o, o2);
    assert.deepStrictEqual(o2, {a: 2});
  });
  
  it("delete", () => {
    const o = {a: 1};
    const o2 = deepReplace(o, {});
    assert.equal(o, o2);
    assert.deepStrictEqual(o2, {});
  });
  
  it("add", () => {
    const o = {a: 1};
    const o2 = deepReplace(o, {a: 1, b: 2});
    assert.equal(o, o2);
    assert.deepStrictEqual(o2, {a: 1, b: 2});
  });
  
  it("nested", () => {
    const o = {a: 1};
    const o2 = {a: 1, b: o};
    const o3 = deepReplace(o2, {b: {b: 3}});
    assert.equal(o2.b, o);
    assert.equal(o3, o2);
    assert.deepStrictEqual(o2, {b: {b: 3}});
  });
  
  it("nested array", () => {
    const o = {a: 1};
    const o2 = [o];
    const o3 = deepReplace(o2, [{a: 3}]);
    assert.equal(o2[0], o);
    assert.equal(o3, o2);
    assert.deepStrictEqual(o2, [{a: 3}]);
  });
  
  it("handle null property", () => {
    const o = {a: null};
    const o2 = {a: null};
    deepReplace(o, o2);
  });
});

describe("diffText", () => {
  it("get the frame correctly when the screen range is out of index", () => {
    const result = assertJSON.diffText(
      "1\n3\n3\n4\n5\n6\n7",
      "1\n2\n3\n4\n5\n6\n7"
    );
    assert(result);
    assert.equal(result.actual, "1\n3\n3\n4\n5\n6");
    assert.equal(result.expected, "1\n2\n3\n4\n5\n6");
  });
  
  it("work when two files have different line numbers", () => {
    const result = assertJSON.diffText(
      "1\n2\n3\n4\n5\n7\n7",
      "1\n2\n3\n4\n5\n6\n7\n8"
    );
    assert(result);
    assert.equal(result.actual, "1\n2\n3\n4\n5\n7\n7");
    assert.equal(result.expected, "1\n2\n3\n4\n5\n6\n7\n8");
  });
  
  it("don't trim whitespaces", () => {
    const result = assertJSON.diffText(
      " 1\n 2\n 3",
      " 1\n 3\n 3"
    );
    assert(result);
    assert.equal(result.actual, " 1\n 2\n 3");
    assert.equal(result.expected, " 1\n 3\n 3");
  });
});

describe("parseJSON", () => {
  it("convert index to location", () => {
    assert.throws(
      () => assertJSON.parseJSON('{"a": 1,}'),
      /line 1 col 9/
    );
  });
  
  it("customize filename", () => {
    assert.throws(
      () => assertJSON.parseJSON('{"a": 1,}', "test.json"),
      /in test.json/
    );
  }); 
});