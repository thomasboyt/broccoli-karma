#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var broccoli = require('broccoli');
var watch = require('../src/watch');

// start broccoli builder + karma runner/watcher
var tree = broccoli.loadBrocfile();
watch(new broccoli.Builder(tree), 'dist');

// check that karma.conf.js exists
try {
  fs.statSync('karma.conf.js');
} catch(err) {
  if ( err.code === 'ENOENT' ) {
    throw new Error('karma.conf.js not found');
  }
  throw err;
}

// run karma
var backgroundPath = path.join(__dirname, '..', 'src', 'background.js');

var config = JSON.stringify({
  configFile: path.resolve('karma.conf.js')
});

var backgroundProcess = spawn('node', [backgroundPath, config]);

process.on('exit', function() {
  backgroundProcess.kill();
});
