
require('dotenv').load();

module.exports = (grunt) => {
  grunt.initConfig({
    nodemon: {
      dev: {
        script: 'app/index.js',
        options: {
          callback: (nodemon) => {
            nodemon.on('log', (event) => {
              console.log(event.colour);
            });
          },
          env: {
            NODE_ENV: grunt.option('env') || 'local',
            PORT: process.env.PORT
          },
          cwd: __dirname,
          ignore: ['node_modules/**'],
          ext: 'js',
          delay: 500
        }
      }
    },
    eslint: {
      target: ['./app/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['eslint']);
};
