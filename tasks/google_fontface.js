/*
 * grunt-google-fontface
 * https://github.com/blinklv/grunt-google-fontface
 *
 * Copyright (c) 2018 blinklv
 * Licensed under the MIT license.
 */

'use strict';

// The implementation of this plugin relies on ES6 syntax; If the version of your
// NodeJS is too old, you should upgrade it.
module.exports = function(grunt) {
    const path = require('path');
    const request = require('request');
    const isWindows = process.platform === 'win32';

    // The path separator ('\') of Windows is different from UNIX-like's ('/');
    // The following function converts backslash characters of a path to slash
    // characters.
    function unixifyPath(filepath) {
        return isWindows ? filepath.replace(/\\/g, '/') : filepath;
    }

    function detectDestType(dest) {
        return grunt.util._.endsWith(dest, '/') ? 'directory' : 'file';
    }

    // Mapping weight descriptions to weight numbers.
    const weights = {
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

    // Encoding font informations to the 'family' url parameter.
    function encodeFont(name, formats) {
        let parameter = encodeName(name);
        let str = formats.slice(1).reduce( (parameter, format) => parameter + ',' + encodeFormat(format), encodeFormat(formats[0]));
        if (str !== '') {
            parameter += ':' + str;
        }
        return parameter;
    }

    function encodeFormat(format) {
        if (format.weight === undefined && format.style === undefined) {
            return '';
        }

        // We only handle 'Italic' style now.
        return (weights[format.weight] ? weights[format.weight]: 400) +
            (format.style === 'Italic' ? 'i': '');
    }

    function encodeName(name) {
        return name.replace(/([A-Z][a-z])/g, (match, p) => '+' + p).replace(/^\+/, '');
    }

    // Using keys of the 'weights' object generating matching pattern seems
    // better than hard coding :)
    const weightDescs = Object.keys(weights).join('|');
    const refont = new RegExp(`^(\\w+)(?:-(${weightDescs})?(\\w+)?)?\\.ttf$`);

    // Extracts the font name and the font format (include weight and style) from
    // a TTF file name which should satisfy the standard format 'Name-WeightStyle'.
    function extract(filename) {
        const results = refont.exec(path.basename(unixifyPath(filename)));
        if (results === null || results.length < 2) {
            grunt.log.error(`The name of the TTF file '${filename}' is not standard`);
            return;
        }
        return [results[1], { weight: results[2], style: results[3] }];
    }

    const resrc = /src: local\('(.*?)'\), local\('(.*?)'\).*/g;
    // We can't directly use CSS files fetched from Google because some url
    // references ('src' field) in them don't point to your local TTF files.
    // modifySrc function will modify them to satisfy our needs that making
    // urls reference local TTF files.
    function modifySrc(body, file) {
        return body.replace(resrc, (match, name1, name2) =>{
            let fontfile = name2file(name2, file);
            if (fontfile === null) {
                fontfile = name2file(name1, file);
            }

            return fontfile !== null ?
                `src: local('${name1}'), local('${name2}'), url(${path.relative(file.dest, fontfile)});`:
                match;
        });
    }

    function name2file(name, file) {
        const re = new RegExp(name + '.ttf$');
        for (let e of file.src) {
            if (re.test(e)) {
                return e;
            }
        }
        return null;
    }


  grunt.registerMultiTask('google_fontface', 'Fetch CSS files of fonts from Google.', function() {
      const options = this.options({
        // The URL which you can fetch CSS files for your TTF files, although I think
        // you won't change this option in most cases.
        url: 'https://fonts.googleapis.com/css'
      });

      // A WaitGroup implementation for this plugin. You can read more details how
      // to use it from: https://golang.org/pkg/sync/#WaitGroup.
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
                      return;
                  }
                  this.wait();
              }, 0);
          }
        };

      function fetch(family, file) {
          const url = `${options.url}?family=${family}`;
          wg.add();
          request(url, (error, res, body) => {
              if (error !== null || res.statusCode !== 200) {
                  grunt.log.error(`fetch '${url}' failed: ${error !== null ? error : res.statusCode}`);
                  return;
              }

              grunt.log.ok(`fetch '${url}' successfully`);
              grunt.file.write(file.dest, modifySrc(body, file));
              wg.done();
          });
      }

      this.files.forEach((file) => {
          let fonts = {};
          file.src.forEach((filename) => {
              let [name, format] = extract(filename);
              if (!fonts.hasOwnProperty(name)) {
                  fonts[name] = [];
              }
              fonts[name] = [...fonts[name], format];
          });

          const names = Object.keys(fonts);
          if (detectDestType(file.dest) === 'file') {
              const family = names.slice(1).reduce((family, name) => {
                  return family + '|' + encodeFont(name, fonts[name]);
              }, encodeFont(names[0], fonts[names[0]]));
              fetch(family, file);
          } else {
              names.forEach((name) => {
                  fetch(encodeFont(name, fonts[name]), {src: file.src, dest: `${file.dest}${name}.css`});
              });
          }
      });

      wg.wait();
  });
};
