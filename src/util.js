var RSVP = require('rsvp');
var rimraf = require('rimraf');
var copyDereferenceSync = require('copy-dereference').sync;

function copyDir(dir, outputDir) {
  try {
    copyDereferenceSync(dir, outputDir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
    console.error('Error: Directory "' + outputDir + '" already exists. Refusing to overwrite files.');
    process.exit(1);
  }
}

function rmDir(dir) {
  return RSVP.denodeify(rimraf)(dir);
}

module.exports = {
  copyDir: copyDir,
  rmDir: rmDir
};
