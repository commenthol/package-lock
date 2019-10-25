/* global describe, it */

const assert = require('assert')
const traverse = require('traverse')
const path = require('path')
const { compose } = require('asyncc')
// const { mkdir, touch } = require('shelljs')
const {
  packagePath,
  findPackages,
  buildTree,
  // writeJsonSync,
  _sanitizeTree,
  readPackageJsonSync
} = require('../src/utils')

describe('#utils', function () {
  describe('packagePath', function () {
    it('should parse package path', function () {
      const path = 'node_modules/debug/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, ['debug'])
    })
    it('should parse scoped package path', function () {
      const path = 'node_modules/@my/debug/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, ['@my/debug'])
    })
    it('should ignore package path with package depth 2', function () {
      const path = 'node_modules/debug/example/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, [])
    })
    it('should ignore scoped package path with package depth 3', function () {
      const path = 'node_modules/@my/debug/example/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, [])
    })
    it('should parse package path with submodule', function () {
      const path = 'node_modules/debug/node_modules/semver/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, ['debug', 'semver'])
    })
    it('should parse scoped package path with submodule', function () {
      const path = 'node_modules/@my/debug/node_modules/semver/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, ['@my/debug', 'semver'])
    })
    it('should parse scoped package path with scoped submodule', function () {
      const path = 'node_modules/@my/debug/node_modules/@other/semver/package.json'
      const res = packagePath(path)
      assert.deepStrictEqual(res, ['@my/debug', '@other/semver'])
    })
  })

  describe('findPackages', function () {
    it('should find packages', function (done) {
      const exp = [
        'node_modules/@s/a/node_modules/@t/b/package.json',
        'node_modules/@s/a/node_modules/a/node_modules/d/package.json',
        'node_modules/@s/a/node_modules/a/package.json',
        'node_modules/@s/a/node_modules/b/package.json',
        'node_modules/@s/a/package.json',
        'node_modules/a/node_modules/c/package.json',
        'node_modules/a/package.json',
        'node_modules/b/package.json',
        'node_modules/c/package.json',
        'node_modules/f/package.json'
      ]

      // exp.forEach(filename => {
      //   const f = path.resolve(__dirname, filename)
      //   mkdir('-p', path.dirname(f))
      //   touch(f)
      // })

      findPackages(__dirname, (err, data) => {
        assert.ok(!err, '' + err)
        const res = data.map((p) => path.relative(__dirname, p))
        assert.deepStrictEqual(res, exp)
        done()
      })
    })
  })

  describe('_sanitizeTree', function () {
    it('should sanitize tree', function () {
      const exp = require('./fixtures/sanitize.json')
      const tree = require('./fixtures/sanitize-inp.json')
      const res = _sanitizeTree(tree)
      // writeJsonSync(`${__dirname}/fixtures/sanitize.json`, res)
      assert.deepStrictEqual(res, exp)
    })
  })

  describe('buildTree', function () {
    it('should build tree', function (done) {
      const exp = require('./fixtures/intern.json')
      const dirname = __dirname
      compose(
        (nul, cb) => findPackages(dirname, cb),
        (pckgfiles, cb) => buildTree(pckgfiles, dirname, cb)
      )(null, (err, tree) => {
        assert.ok(!err, '' + err)
        // normalize test paths
        const norm = traverse(tree).map(function () {
          if (this.key === 'path') {
            this.update(path.relative(__dirname, this.node))
          }
        })
        // writeJsonSync(`${__dirname}/fixtures/intern.json`, norm)
        assert.deepStrictEqual(norm, exp)
        done()
      })
    })
  })

  describe('readPackageJsonSync', function () {
    it('should not throw if not found', function () {
      const res = readPackageJsonSync(__dirname)
      assert.strictEqual(res, undefined)
    })
    it('should read if present', function () {
      const res = readPackageJsonSync(`${__dirname}/..`)
      assert.strictEqual(typeof res, 'object')
      assert.strictEqual(typeof res.name, 'string')
    })
  })
})
