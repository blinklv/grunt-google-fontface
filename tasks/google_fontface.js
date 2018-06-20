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
    const extract = /^(\w+)(?:-(Thin|Light|Regular|Medium|Bold|Black)?(\w+)?)?\.ttf$/;

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


    // Dancing+Script:400,700|Eater|Gloria+Hallelujah|Roboto:100,300,300i,400,500,700,900
    const encodeFont = function(name, formats) {
        let parameter = encodeName(name);
        let str = formats.slice(1).reduce( (parameter, format) => parameter + ',' + encodeFormat(format), encodeFormat(formats[0]));
        if (str !== '') {
            parameter += ':' + str;
        }
        return parameter;
    };

    const encodeFormat = (format) => {
        if (format.weight === undefined && format.style === undefined) {
            return '';
        }
        return (weights[format.weight] ? weights[format.weight]: 400) + 
            (format.style === 'Italic' ? 'i': '');
    }

    const encodeName = function(name) {
        return name.replace(/([A-Z])/g, (match, p) => '+' + p).replace(/^\+/, '');
    };


    const weights = {
        Thin: 100,
        Light: 300,
        Regular: 400,
        Medium: 500,
        Bold: 700,
        Black: 900
    };

    let fonts = {};

    this.files.forEach(function(file) {
        file.src.forEach(function(src) {
            let results = extract.exec(path.basename(unixifyPath(src)));
            if (results === null || results.length < 2) {
                grunt.log.error(sprintf("The name of the file '%s' is not standard", src));
            }

            if (!fonts.hasOwnProperty(results[1])) {
                fonts[results[1]] = [];
            }

            fonts[results[1]] = [...fonts[results[1]], { weight: results[2], style: results[3] }];
        });

        const names = Object.keys(fonts);
        let family = names.slice(1).reduce((family, name) => {
            return family + '|' + encodeFont(name, fonts[name]);
        }, encodeFont(names[0],fonts[names[0]]));

        let url = options.url + '?family=' + family;
        console.log(url);
    });
  });

};
