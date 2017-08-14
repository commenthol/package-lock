/* global describe, it */

const assert = require('assert')
// const {writeJsonSync} = require('../src/utils')
const {genPackageLock, genPackageJson} = require('../src/generate')

describe('#generate', function () {
  const tree = require('./fixtures/intern.json')

  it('should generate package-lock', function () {
    const exp = require('./fixtures/package-lock-1.json')
    const res = genPackageLock(tree)
    // writeJsonSync(__dirname + '/fixtures/package-lock-1.json', res)
    assert.deepEqual(res, exp)
  })

  it('should generate package-lock with input from package.json', function () {
    const exp = require('./fixtures/package-lock-2.json')
    const pckg = {
      name: '@private/mypack',
      version: '1.1.1',
      dependencies: {
        '@s/a': '^0.0.1',
        'b': '1.0.0'
      }
    }
    const res = genPackageLock(tree, pckg)
    // writeJsonSync(__dirname + '/fixtures/package-lock-2.json', res)
    assert.deepEqual(res, exp)
  })

  it('should generate package-lock replacing resolved', function () {
    const exp = require('./fixtures/package-lock-3.json')
    const res = genPackageLock(tree, null, {resolve: 'http://localhost:4873'})
    // writeJsonSync(__dirname + '/fixtures/package-lock-3.json', res)
    assert.deepEqual(res, exp)
  })

  it('should generate a package.json', function () {
    const exp = require('./fixtures/package-1.json')
    const res = genPackageJson(tree)
    // writeJsonSync(__dirname + '/fixtures/package-1.json', res)
    assert.deepEqual(res, exp)
  })

  it('should generate a package.json with input', function () {
    const exp = require('./fixtures/package-2.json')
    const pckg = {
      name: '@private/mypack',
      version: '1.1.1',
      dependencies: {
        '@s/a': '^0.0.1',
        'b': '1.0.0'
      }
    }
    const res = genPackageJson(tree, pckg)
    // writeJsonSync(__dirname + '/fixtures/package-2.json', res)
    assert.deepEqual(res, exp)
  })
})
