'use strict';

// This tests that the lower bits of mode > 0o777 still works in fs.open().

const common = require('../common');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

let mode;

if (common.isWindows) {
  mode = 0o444;
} else {
  mode = 0o644;
}
if (common.isAndroid) {
  // On Android, writing in the Application files only sets permissions
  // for the user associated with the App.
  mode = mode & 0o700;
}

const maskToIgnore = 0o10000;

const tmpdir = require('../common/tmpdir');
tmpdir.refresh();

function test(mode, asString) {
  const suffix = asString ? 'str' : 'num';
  const input = asString ?
    (mode | maskToIgnore).toString(8) : (mode | maskToIgnore);

  {
    const file = path.join(tmpdir.path, `openSync-${suffix}.txt`);
    const fd = fs.openSync(file, 'w+', input);
    assert.strictEqual(fs.fstatSync(fd).mode & 0o777, mode);
    fs.closeSync(fd);
    assert.strictEqual(fs.statSync(file).mode & 0o777, mode);
  }

  {
    const file = path.join(tmpdir.path, `open-${suffix}.txt`);
    fs.open(file, 'w+', input, common.mustCall((err, fd) => {
      assert.ifError(err);
      assert.strictEqual(fs.fstatSync(fd).mode & 0o777, mode);
      fs.closeSync(fd);
      assert.strictEqual(fs.statSync(file).mode & 0o777, mode);
    }));
  }
}

test(mode, true);
test(mode, false);
