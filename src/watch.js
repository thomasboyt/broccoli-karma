var path = require('path');
var util = require('./util');
var RSVP = require('rsvp');

var Watcher = require('broccoli/lib/watcher');

var runner = require('karma').runner;

module.exports = function(builder, outputDir, options) {
  options = options || {};

  var watcher = new Watcher(builder);
  var currentCopy = null;

  // We register these so the 'exit' handler removing temp dirs is called
  process.on('SIGINT', function () {
    process.exit(1);
  });
  process.on('SIGTERM', function () {
    process.exit(1);
  });

  watcher.on('change', function(dir) {
    // Don't allow two copies to happen simultaneously - chain off of existing copy
    if (currentCopy) {
      currentCopy = currentCopy.catch(function(error) {
        if (error.code !== 'ENOENT') {
          // ENOENT is allowed, as it means that the temp dir was cleared before it had a chance to
          // copy.
          console.error(error.stack);
          process.exit(1);
        }
      }).then(function() {
        return cleanAndCopy(dir.directory, outputDir);
      });
    } else {
      currentCopy = cleanAndCopy(dir.directory, outputDir);
    }

    var previous = currentCopy;
    var next = currentCopy.then(function() {
      if (previous !== currentCopy) {
        // more actions have been chained, skipping
        return;
      }
      currentCopy = next;
      return new RSVP.Promise(function (resolve, reject) {
        // Need to wait for the previous runner to finish
        runner.run({
          port: 9876,
          configFile: path.resolve('karma.conf.js')
        }, resolve);
      });
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
  });
}
