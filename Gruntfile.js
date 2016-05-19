module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gitpush: {
      your_target: {
        options: {
          branch: 'master',
          remote: 'live'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['public/client/**/*.js', 'public/lib/**/*.js' ],
        dest: 'public/dist/<%= pkg.name %>.min.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['public/dist/<%= pkg.name %>.min.js']
        }
      }
    },

    eslint: {
      target: [
        '*.js', '!*.min.js'
        // Add list of files to lint here
      ]
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public',
          src: ['*.css', '!*.min.css'],
          dest: 'public',
          ext: '.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: [
          '*/**.js',
          '!*/**.min.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: ['*.css', '!*min.css'],
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-git');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'format', 'nodemon']);
  });

  grunt.registerTask('code-dev', function (target) {
    grunt.task.run([ 'format', 'watch']);
  });  

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////
  grunt.registerTask('format', ['concat', 'uglify', 'cssmin']);

  grunt.registerTask('lint', ['eslint']);

  grunt.registerTask('watchChanges', ['watch']);

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('build', []);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run(['gitpush']);
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run(['mochaTest', 'eslint', 'format', 'gitpush']);
    } else {
      grunt.task.run(['mochaTest', 'eslint', 'format', 'nodemon']);
    }
  });

  grunt.registerTask('start', ['nodemon']);

  grunt.registerTask('push', ['gitpush']);

};
