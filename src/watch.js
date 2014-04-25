var path = require('path');
var util = require('./util');

var Watcher = require('broccoli').Watcher;

var runner = require('karma').runner;

module.exports = function(builder, outputDir, options) {
  options = options || {};

  var watcher = new Watcher(builder);
  var currentCopy = null;
  var didInitialBuild = false;

  // We register these so the 'exit' handler removing temp dirs is called
  process.on('SIGINT', function () {
    process.exit(1);
  });
  process.on('SIGTERM', function () {
    process.exit(1);
  });

  watcher.on('change', function(dir) {
    // Ignore intiial build
    if ( !didInitialBuild ) {
      didInitialBuild = true;
      return;
    }

    // Don't allow two copies to happen simultaneously - chain off of existing copy
    if (currentCopy) {
      currentCopy = currentCopy.finally(function() {
        currentCopy = cleanAndCopy(dir, outputDir);
      });
    } else {
      currentCopy = cleanAndCopy(dir, outputDir);
    }

    currentCopy.then(function() {
      // empty function is passed so that it doesn't exit after running
      runner.run({
        port: 9876,
        configFile: path.resolve('karma.conf.js')
      }, function() {});
      currentCopy = null;
    });
  });

  watcher.on('error', function(err) {
    console.log('Built with error:');
    // Should also show file and line/col if present; see cli.js
    console.log(err.stack);
    console.log('');
  });
};

function cleanAndCopy (dir, outputDir) {
  return util.rmDir(outputDir).then(function() {
    return util.copyDir(dir, outputDir);
  }).catch(function(errors) {
    if (errors[0].code !== 'ENOENT') {
      // ENOENT is allowed, as it means that the temp dir was cleared before it had a chance to
      // copy.
      throw errors[0];
    }
  });
}
