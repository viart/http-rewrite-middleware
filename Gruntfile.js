/*
 * http-rewrite-middleware
 * https://github.com/viart/http-rewrite-middleware
 *
 * Copyright (c) 2013 Artem Vitiuk
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'index.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc',
            }
        },

        nodeunit: {
            tests: ['test/*_test.js']
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('test', ['nodeunit']);
    grunt.registerTask('default', ['jshint', 'test']);
};
