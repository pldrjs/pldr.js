module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		name: 'pldr.js',

		banner: '/*!\n' +
				' * pldr.js <%= pkg.version %> by pldrjs\n' +
				' * Copyright 2015-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
				' * Licensed under the <%= pkg.license %> license\n' +
				' */\n',

		clean: {
			dist: 'dist'
		},

		watch: {
			js: {
				files: ["js/*.js"],
				tasks: ['dist-js']
			}
		},

		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015']
			},
			dist: {
				files: [{
					cwd: 'js',
					expand: true,
					src: ['*.js'],
					dest: 'dist/js'
				}]
			}
		},

		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: false
			},
			dist: {
				src: [
					'dist/js/*.js'
				],
				dest: 'dist/pldr.js'
			}
		},

		uglify: {
			options: {
				preserveComments: 'some'
			},
			dist: {
				src: 'dist/pldr.js',
				dest: 'src/main/resources/pldr.js'
			}
		}
	});

	grunt.registerTask('dist-js', ['babel', 'concat', 'uglify']);
	grunt.registerTask('dist', ['clean', 'dist-js']);
	grunt.registerTask('default', ['dist']);
	grunt.registerTask('watch-js', ['watch:js']);
};
