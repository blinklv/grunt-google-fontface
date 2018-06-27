//  google_fontface_test.js
//
// Author: blinklv <blinklv@icloud.com>
// Create Time: 2018-06-26
// Maintainer: blinklv <blinklv@icloud.com>
// Last Change: 2018-06-27

(() => {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const css = require('css');
    const isWindows = process.platform === 'win32';
    const reurl = /url\((.*?)\)/;

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

    // Using keys of the 'weights' object generating matching pattern seems
    // better than hard coding :)
    const weightDescs = Object.keys(weights).join('|');
    const refont = new RegExp(`^(\\w+)(?:-(${weightDescs})?(\\w+)?)?\\.ttf$`);

    // The path separator ('\') of Windows is different from UNIX-like's ('/');
    // The following function converts backslash characters of a path to slash
    // characters.
    function unixifyPath(filepath) {
        return isWindows ? filepath.replace(/\\/g, '/') : filepath;
    }

    // Extracts the font name and the font format (include weight and style) from
    // a TTF file name which should satisfy the standard format 'Name-WeightStyle'.
    function extract(test, filename) {
        const results = refont.exec(path.basename(unixifyPath(filename)));
        if (results === null || results.length < 2) {
            test.ok(false, `The name of the TTF file '${filename}' is not standard`);
            return;
        }
        return { 
            family: results[1], 
            weight: weights[results[2]] ? weights[results[2]]: 400,
            style: results[3] !== undefined ? results[3].toLowerCase() : 'normal'
        };
    }

    function check(test, file) {
        const content = fs.readFileSync(file, 'utf8');
        const obj = css.parse(content);
        const fonts = obj.stylesheet.rules.map((rule) => {
            const d = rule.declarations;
            return [{ 
                family: d[0].value.replace(/('|\s)/g, ''),
                style: d[1].value, 
                weight: Number(d[2].value)
            }, path.resolve(path.dirname(file), (reurl.exec(d[3].value))[1])];
            
        });

        fonts.forEach((font) => {
            const [format, path] = font;
            test.ok(fs.existsSync(path), `'${path}' doesn't exist`);
            const actual = extract(test, path);
            test.deepEqual(actual, format);
        });
    }

    exports.google_fontface = {
        single_file: function(test) {
            check(test, 'test/css/font.css');
            test.done();
        },
        multiple_files: function(test) {
            fs.readdirSync('test/css/font/').forEach((file) => {
                check(test, `test/css/font/${file}`);
            });
            test.done();
        },
        multiple_directoires: function(test) {
            fs.readdirSync('test/css/').forEach((dir) => {
                if (dir!== 'font' && fs.lstatSync(`test/css/${dir}`).isDirectory()) {
                    fs.readdirSync(`test/css/${dir}/`).forEach((file) => {
                        check(test, `test/css/${dir}/${file}`);
                    });
                }
            });
            test.done();
        }
    };
}) ();

