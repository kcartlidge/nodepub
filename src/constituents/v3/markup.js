const markup = {

  /**
   * Provide the contents page.
   * @param {Object} document - the EPUB document
   * @param {String} overrideContents - optional markup to replace the default contents body
   * @returns the HTML
   */
  getContents: (document, overrideContents) => {
    document.view.overrideContents = overrideContents || null
    return document.renderTextFile('contents')
  },

  /**
   * Provide the contents of the TOC file.
   * Defers to `getContents` for the innards.
   * @param {Object} document - the EPUB document
   * @returns the TOC file content (with any replacements applied)
   */
  getTOC: (document) => {
    let overrideContents = null
    if (document.generateContentsCallback) {
      overrideContents = document.generateContentsCallback(document.filesForTOC)
    }
    return markup.getContents(document, overrideContents)
  },

  /**
   * Provide the contents of the cover HTML enclosure.
   * @param {Object} document - the EPUB document
   * @returns the HTML (with any replacements applied)
   */
  getCover: (document) => document.renderTextFile('cover'),

  /**
   * Provide the contents of the CSS file.
   * @param {Object} document - the EPUB document
   * @returns the CSS (with any replacements applied)
   */
  getCSS: (document) => document.renderTextFile('css'),

  /**
   * Provide the contents of a single section's HTML.
   * @param {Object} document - the EPUB document
   * @param {Int} sectionNumber - the section to generate
   * @returns the HTML (with any replacements applied)
   */
  getSection: (document, sectionNumber) => {
    document.refreshView(document.sections[sectionNumber - 1])
    return document.renderTextFile('section')
  }

}

module.exports = markup
