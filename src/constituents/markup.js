const path = require('path')
const replacements = require('./replacements')

const markup = {

  /**
   * Provide the contents page.
   * @param {Object} document - the EPUB document
   * @param {Boolean} overrideContents - optional function to override contents creation
   * @returns the HTML
   */
  getContents: (document, overrideContents) => {
    let result = ''
    result += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]"
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd' >[[EOL]]"
    result += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]"
    result += '  <head>[[EOL]]'
    result += '    <title>[[CONTENTS]]</title>[[EOL]]'
    result += "    <link rel='stylesheet' type='text/css' href='../css/ebook.css' />[[EOL]]"
    result += '  </head>[[EOL]]'
    result += '  <body>[[EOL]]'

    if (overrideContents) {
      result += overrideContents
    } else {
      result += "    <div class='contents'>[[EOL]]"
      result += '      <h1>[[CONTENTS]]</h1>[[EOL]]'
      for (let i = 1; i <= document.sections.length; i += 1) {
        const section = document.sections[i - 1]
        if (!section.excludeFromContents) {
          const { title } = section
          result += `      <a href='s${i}.xhtml'>${title}</a><br/>[[EOL]]`
        }
      }
      result += '    </div>[[EOL]]'
    }
    result += '  </body>[[EOL]]'
    result += '</html>[[EOL]]'
    return result
  },

  /**
   * Provide the contents of the TOC file.
   * Defers to `getContents` for the innards.
   * @param {Object} document - the EPUB document
   * @returns the TOC file content (with any replacements applied)
   */
  getTOC: (document) => {
    let content = ''
    if (document.generateContentsCallback) {
      const callbackContent = document.generateContentsCallback(document.filesForTOC)
      content = markup.getContents(document, callbackContent)
    } else {
      content = markup.getContents(document)
    }
    return replacements(document, replacements(document, content))
  },

  /**
   * Provide the contents of the cover HTML enclosure.
   * @param {Object} document - the EPUB document
   * @returns the HTML (with any replacements applied)
   */
  getCover: (document) => {
    const coverFilename = path.basename(document.coverImage)
    let result = ''
    result += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]"
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'  'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]"
    result += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>[[EOL]]"
    result += '<head>[[EOL]]'
    result += '  <title>[[TITLE]]</title>[[EOL]]'
    result += "  <style type='text/css'>[[EOL]]"
    result += '    body { margin: 0; padding: 0; text-align: center; }[[EOL]]'
    result += '    .cover { margin: 0; padding: 0; font-size: 1px; }[[EOL]]'
    result += '    img { margin: 0; padding: 0; height: 100%; }[[EOL]]'
    result += '  </style>[[EOL]]'
    result += '</head>[[EOL]]'
    result += '<body>[[EOL]]'
    result += `  <div class='cover'><img style='height: 100%;width: 100%;' src='images/${coverFilename}' alt='Cover' /></div>[[EOL]]`
    result += '</body>[[EOL]]'
    result += '</html>[[EOL]]'

    return replacements(document, replacements(document, result))
  },

  /**
   * Provide the contents of the CSS file.
   * @param {Object} document - the EPUB document
   * @returns the CSS (with any replacements applied)
   */
  getCSS: (document) => replacements(document, replacements(document, document.CSS)),

  /**
   * Provide the contents of a single section's HTML.
   * @param {Object} document - the EPUB document
   * @param {Int} sectionNumber - the section to generate
   * @returns the HTML (with any replacements applied)
   */
  getSection: (document, sectionNumber) => {
    const section = document.sections[sectionNumber - 1]
    const { title } = section
    const { content } = section

    let result = ''
    result += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]"
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]"
    result += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]"
    result += "  <head profile='http://dublincore.org/documents/dcmi-terms/'>[[EOL]]"
    result += "    <meta http-equiv='Content-Type' content='text/html;' />[[EOL]]"
    result += `    <title>[[TITLE]] - ${title}</title>[[EOL]]`
    result += "    <meta name='DCTERMS.title' content='[[TITLE]]' />[[EOL]]"
    result += "    <meta name='DCTERMS.language' content='[[LANGUAGE]]' scheme='DCTERMS.RFC4646' />[[EOL]]"
    result += "    <meta name='DCTERMS.source' content='MFW' />[[EOL]]"
    result += "    <meta name='DCTERMS.issued' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]"
    result += "    <meta name='DCTERMS.creator' content='[[AUTHOR]]'/>[[EOL]]"
    result += "    <meta name='DCTERMS.contributor' content='' />[[EOL]]"
    result += "    <meta name='DCTERMS.modified' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]"
    result += "    <meta name='DCTERMS.provenance' content='' />[[EOL]]"
    result += "    <meta name='DCTERMS.subject' content='[[GENRE]]' />[[EOL]]"
    result += "    <link rel='schema.DC' href='http://purl.org/dc/elements/1.1/' hreflang='en' />[[EOL]]"
    result += "    <link rel='schema.DCTERMS' href='http://purl.org/dc/terms/' hreflang='en' />[[EOL]]"
    result += "    <link rel='schema.DCTYPE' href='http://purl.org/dc/dcmitype/' hreflang='en' />[[EOL]]"
    result += "    <link rel='schema.DCAM' href='http://purl.org/dc/dcam/' hreflang='en' />[[EOL]]"
    result += "    <link rel='stylesheet' type='text/css' href='../css/ebook.css' />[[EOL]]"
    result += '  </head>[[EOL]]'
    result += '  <body>[[EOL]]'
    result += `    <div id='s${sectionNumber}'></div>[[EOL]]`
    result += '    <div>[[EOL]]'

    const lines = content.split('\n')
    lines.forEach((line) => {
      if (line.length > 0) {
        result += `${line}[[EOL]]`
      }
    })

    result += '    </div>[[EOL]]'
    result += '  </body>[[EOL]]'
    result += '</html>[[EOL]]'

    return replacements(document, replacements(document, result))
  }

}

module.exports = markup
