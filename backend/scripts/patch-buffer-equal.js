// Node 22+ removed the global SlowBuffer, which crashes the old
// `buffer-equal-constant-time` package (a transitive dep of jsonwebtoken).
// This script rewrites that package's index.js to guard SlowBuffer access.
// Runs automatically via the "postinstall" npm hook so it survives reinstalls.
const fs = require('fs');
const path = require('path');

const target = path.join(
    __dirname,
    '..',
    'node_modules',
    'buffer-equal-constant-time',
    'index.js'
);

const patched = `/*jshint node:true */
'use strict';
var Buffer = require('buffer').Buffer; // browserify
var SlowBuffer = require('buffer').SlowBuffer; // undefined on modern Node; guarded below

module.exports = bufferEq;

function bufferEq(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  var c = 0;
  for (var i = 0; i < a.length; i++) {
    /*jshint bitwise:false */
    c |= a[i] ^ b[i]; // XOR
  }
  return c === 0;
}

bufferEq.install = function() {
  Buffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
  if (SlowBuffer && SlowBuffer.prototype) {
    SlowBuffer.prototype.equal = function equal(that) {
      return bufferEq(this, that);
    };
  }
};

var origBufEqual = Buffer.prototype.equal;
var origSlowBufEqual = (SlowBuffer && SlowBuffer.prototype) ? SlowBuffer.prototype.equal : undefined;
bufferEq.restore = function() {
  Buffer.prototype.equal = origBufEqual;
  if (SlowBuffer && SlowBuffer.prototype) {
    SlowBuffer.prototype.equal = origSlowBufEqual;
  }
};
`;

try {
    if (fs.existsSync(target)) {
        fs.writeFileSync(target, patched, 'utf8');
        console.log('[patch-buffer-equal] Patched buffer-equal-constant-time for Node 22+ compatibility.');
    } else {
        console.log('[patch-buffer-equal] Target not found, skipping (nothing to patch).');
    }
} catch (e) {
    console.warn('[patch-buffer-equal] Failed to patch:', e.message);
}
