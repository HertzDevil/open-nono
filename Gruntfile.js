module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'public/js/**/*.js'],
			options: {
				esversion: 6
			}
		},
		browserify: {
			dist: {
				files: {
					// destination for transpiled js : source js
					'dist/js/app.js': 'public/js/app.js'
				},
				options: {
					transform: [['babelify']],
					browserifyOptions: {
						debug: true
					}
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/js/app.min.js': 'dist/js/app.js'
				}
			}
		},
	});
	grunt.registerTask('default', ['jshint', 'browserify:dist', 'uglify']);
};
