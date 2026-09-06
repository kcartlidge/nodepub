const structural = require('./structural.js')
const markup = require('./markup.js')

/**
 * Ordered list of EPUB 2 publication files (text/XML only; images are added later).
 * The mimetype entry MUST remain first and uncompressed.
 * @param {Object} document - the EPUB document
 * @returns {Array<{name: String, folder: String, compress: Boolean, content: String}>}
 */
const list = (document) => {
  const files = []

  files.push({
    name: 'mimetype', folder: '', compress: false, content: structural.getMimetype(document)
  })
  files.push({
    name: 'container.xml', folder: 'META-INF', compress: true, content: structural.getContainer(document)
  })
  files.push({
    name: 'ebook.opf', folder: 'OEBPF', compress: true, content: structural.getOPF(document)
  })
  files.push({
    name: 'navigation.ncx', folder: 'OEBPF', compress: true, content: structural.getNCX(document)
  })
  if (document.addInternalCover) {
    files.push({
      name: 'cover.xhtml', folder: 'OEBPF', compress: true, content: markup.getCover(document)
    })
  }

  files.push({
    name: 'ebook.css', folder: 'OEBPF/css', compress: true, content: markup.getCSS(document)
  })
  for (let i = 1; i <= document.sections.length; i += 1) {
    const fname = document.sections[i - 1].filename
    files.push({
      name: `${fname}`, folder: 'OEBPF/content', compress: true, content: markup.getSection(document, i)
    })
  }

  if (document.showContents) {
    files.push({
      name: 'toc.xhtml', folder: 'OEBPF/content', compress: true, content: markup.getTOC(document)
    })
  }

  return files
}

module.exports = { list }
