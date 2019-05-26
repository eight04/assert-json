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
});
