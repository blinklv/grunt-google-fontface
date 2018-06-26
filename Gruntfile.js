/*
 * grunt-google-fontface
 * https://github.com/blinklv/grunt-google-fontface
 *
 * Copyright (c) 2018 blinklv
 * Licensed under the MIT license.
 */


module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                esversion: 6, // Use ES6 as the JavaScript Syntax.
                globals: {
                    jQuery: true
                },
            },
            all: ['Gruntfile.js', 'tasks/*.js']
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            test: ['test/css']
        },

        // Configuration to be run (and then tested).
        google_fontface: {
            single: {
                files: [{
                    src: 'test/font/font-1/**/*.ttf',
                    dest: 'test/css/font-1.css'
                },{
                    src: 'test/font/font-2/**/*.ttf',
                    dest: 'test/css/font-2.css'
                }]
            },
            multiple: {
                files: [{
                    src: 'test/font/**/*.ttf',
                    dest: 'test/css/fonts/'
                },{
                    expand: true,
                    cwd: 'test/font/font-1/',
                    src: '**/*.ttf',
                    dest: 'test/css/',
                    extDot: 'last',
                    ext: '.css'
                },{
                    expand: true,
                    cwd: 'test/font/font-2/',
                    src: '**/*.ttf',
                    dest: 'test/css/',
                    extDot: 'last',
                    ext: '.css'
                }]
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "test/css" dir, then run this
    // plugins's task(s), then test the result.
    grunt.registerTask('test', ['jshint', 'clean', 'google_fontface', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['test']);
};
