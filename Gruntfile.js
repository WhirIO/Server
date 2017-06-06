require('dotenv').load();

const setupNodemon = (grunt, callback) => ({
  dev: {
    script: 'app/index.js',
    options: {
      callback,
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
});

module.exports = (grunt) => {
  grunt.initConfig({
    nodemon: setupNodemon(grunt, (nodemon) => {
      console.log();
      nodemon.on('log', (event) => {
        if (event.type === 'status') {
          console.log(`✔︎ ${event.colour}`);
        }
      });
    }),
    eslint: {
      target: ['./app/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['eslint']);
};
