module.exports = () => ({
  files: [
    'test/*.png',
    'src/**/*.js'
  ],

  tests: [
    'test/**/*spec.js'
  ],

  testFramework: 'mocha',
  debug: true,

  env: {
    type: 'node',
    runner: 'node'
  },

  workers: {
    restart: true,
    initial: 6,
    regular: 2
  }
})
