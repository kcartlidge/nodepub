const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const templatesDir = path.join(__dirname, 'templates')

const loadLf = (filename) => fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n')

/**
 * Compile every `.ejs` file in the templates folder once for this document.
 * @returns {Object} map of basename (without .ejs) to compiled render functions
 */
const compileAll = () => {
  ejs.fileLoader = loadLf
  const compiled = {}
  if (!fs.existsSync(templatesDir)) {
    return compiled
  }
  fs.readdirSync(templatesDir).forEach((file) => {
    if (!file.endsWith('.ejs')) return
    const filename = path.join(templatesDir, file)
    const key = path.basename(file, '.ejs')
    compiled[key] = ejs.compile(loadLf(filename), {
      filename,
      rmWhitespace: false
    })
  })
  return compiled
}

module.exports = { compileAll }
