module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        changelog: {},

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: true,
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    L: false,
                    jQuery: false,
                    MapKnitter: false,

                    /* Test environment */
                    describe: false,
                    it: false,
                    before: false,
                    after: false,
                    beforeEach: false,
                    afterEach: false,
                    chai: false,
                    sinon: false
                }
            },
            source: {
                src: [ 'src/**.js', 'package.json' ]
            },
            grunt: {
                src: ['Gruntfile.js']
            }
        },

        watch: {
            options : {
                livereload: 7777
            },
            source: {
                files: [
                    'src/*.js',
                    'src/core/*.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build' ]
            }
        },

        concat: {
            dist: {
                options: {
                    banner: '(function(window, document, undefined) {\n\n"use strict";\n\n',
                    footer: '\n\n}(window, document));'
                },
                src: [
                    'src/core/**.js',
                    'src/MapKnitter*.js'
                ],
                dest: '/home/justin/prog/mapknitter/app/assets/javascripts/mapknitter.js'
                // dest: 'dist/MapKnitter.js',
            }
        }
    });

    grunt.registerTask('default', [ 'watch' ]);

    grunt.registerTask('build', [ 'jshint', 'concat' ]);

};
