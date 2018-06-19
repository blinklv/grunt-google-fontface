/*
 * grunt-google-fontface
 * https://github.com/blinklv/grunt-google-fontface
 *
 * Copyright (c) 2018 blinklv
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    const http = require('http');
    const path = require('path');
    const isWindows = process.platform === 'win32';
    const extract = /^(\w+)(?:-(Thin|Light|Medium|Blod|Black)?(\w+)?)?\.ttf$/;

  grunt.registerMultiTask('google_fontface', 'Fetch CSS files of fonts from Google.', function() {
    const options = this.options({
        // The resource URL that you can get related CSS files for your fonts.
        url: 'https://fonts.googleapis.com/css'
    });

    const detectDestType = function(dest) {
      if (grunt.util._.endsWith(dest, '/')) {
        return 'directory';
      } else {
        return 'file';
      }
    };

    const unixifyPath = function(filepath) {
      if (isWindows) {
        return filepath.replace(/\\/g, '/');
      } else {
        return filepath;
      }
    };

    const sprintf = function() {
      return [...arguments].reduce((p,c) => p.replace(/%s/,c))
    };

    let fonts = {};

    this.files.forEach(function(file) {
        file.src.forEach(function(src) {
            let results = extract.exec(path.basename(unixifyPath(src)));
            if (results === null) {
                grunt.log.error(sprintf("The name of the file '%s' is not standard", src));
            }
        });
    });
  });

};
