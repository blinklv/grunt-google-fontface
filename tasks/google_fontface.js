/*
 * grunt-google-fontface
 * https://github.com/blinklv/grunt-google-fontface
 *
 * Copyright (c) 2018 blinklv
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    const path = require('path');
    const request = require('request');
    const isWindows = process.platform === 'win32';
    const extract = /^(\w+)(?:-(Thin|ExtraLight|Light|Regular|Medium|SemiBold|Bold|ExtraBold|Black)?(\w+)?)?\.ttf$/;

  grunt.registerMultiTask('google_fontface', 'Fetch CSS files of fonts from Google.', function() {

    const options = this.options({
        url: 'https://fonts.googleapis.com/css'
    });

    const weights = {
        // Mapping weight descriptions to weight numbers.
        Thin: 100,
        ExtraLight: 200,
        Light: 300,
        Regular: 400,
        Medium: 500,
        SemiBold: 600,
        Bold: 700,
        ExtraBold: 800,
        Black: 900
    };

    let wg = {
        count: 0,
        gruntDone: this.async(),
        add() {
            this.count++;
        },
        done() {
            this.count = this.count > 0 ? this.count - 1 : 0;
        },
        wait() {
            setTimeout(() => {
                if (this.count === 0) {
                    this.gruntDone();
                    return
                }
                this.wait();
            }, 0);
        }
    };

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

    const fetch = function(family, dest, src) {
        const requestURL = `${options.url}?family=${family}`;
        wg.add();
        request(requestURL, (error, res, body) => {
            if (error !== null) {
                grunt.log.error(`fetch '${requestURL}' failed: ${error}`);
            } else if (res.statusCode !== 200) {
                grunt.log.error(`fetch '${requestURL}' failed: ${res.statusCode}`);
            } else {
                grunt.log.ok(`fetch '${requestURL}' successfully`);
                grunt.file.write(dest, replaceSrc(body, dest, src));
            }
            wg.done();
        });
    };

    const fontfaceSrc = /src: local\('(.*?)'\), local\('(.*?)'\).*/g;

    const replaceSrc = function(body, dest, src) {
        body = body.replace(fontfaceSrc, (match, name1, name2) => {
            let srcFile = selectSrcFile(src, name2);
            if (srcFile === null) {
                srcFile = selectSrcFile(src, name1);
            }

            if (srcFile !== null) {
                return `src: url(${path.relative(dest, srcFile)});`;
            } 
            return match;
        });
        return body;
    };

    const selectSrcFile = function(src, name) {
        let re = new RegExp(name + '.ttf$');
        for (let srcFile of src) {
            if (re.test(srcFile)) {
                return srcFile;
            }
        }
        return null;
    };


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
        return name.replace(/([A-Z][a-z])/g, (match, p) => '+' + p).replace(/^\+/, '');
    };


    this.files.forEach(function(file) {
        let fonts = {};
        file.src.forEach(function(src) {
            let results = extract.exec(path.basename(unixifyPath(src)));
            if (results === null || results.length < 2) {
                grunt.log.error(`The name of the file '${src}' is not standard`);
            }

            if (!fonts.hasOwnProperty(results[1])) {
                fonts[results[1]] = [];
            }

            fonts[results[1]] = [...fonts[results[1]], { weight: results[2], style: results[3] }];
        });

        const names = Object.keys(fonts);
        if (detectDestType(file.dest) === 'file') {
            const family = names.slice(1).reduce((family, name) => {
                return family + '|' + encodeFont(name, fonts[name]);
            }, encodeFont(names[0],fonts[names[0]]));
            fetch(family, file.dest, file.src);
        } else {
            names.forEach((name) => {
                fetch(encodeFont(name, fonts[name], file.src), `${file.dest}${name}.css`, file.src)
            });
        }
    });
    wg.wait();
  });
};
