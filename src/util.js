var fs = require('fs');
var RSVP = require('rsvp');
var ncp = require('ncp');
var rimraf = require('rimraf');

function copyDir(dir, outputDir) {
  try {
    fs.mkdirSync(outputDir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
    console.error('Error: Directory "' + outputDir + '" already exists. Refusing to overwrite files.');
    process.exit(1);
  }
  return RSVP.denodeify(ncp)(dir, outputDir, {
    clobber: false,
    stopOnErr: true
  });
}

function rmDir(dir) {
  return RSVP.denodeify(rimraf)(dir);
}

module.exports = {
  copyDir: copyDir,
  rmDir: rmDir
};
