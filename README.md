CLI app that wraps Broccoli's watcher and Karma's runner, so that Karma will run on Broccoli builds.

### Usage

Your Karma conf needs to be set up to serve files from a specified output directory (in the below example, `output/`), as well as `autoWatch: false` (to disable the built-in watcher) and `singleRun: false` (so that it will continue to run):

```js
module.exports = function(config) {
  config.set({

    files: [
      'output/**/*.js',
      'output/test/main.js'
    ],

    autoWatch: false,
    singleRun: false

    // ...rest of your config!

  });

};
```

And then just run `broccoli-karma` with `output/` as the specified directory:

```sh
broccoli-karma output/
```
