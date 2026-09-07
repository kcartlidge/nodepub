const structural = {

  /**
   * Provide the contents of the mimetype file (which should not be compressed).
   * @param {Object} document - the EPUB document
   * @returns the mimetype file contents
   */
  getMimetype: (document) => document.renderTextFile('mimetype'),

  /**
   * Provide the contents of the container XML file.
   * @param {Object} document - the EPUB document
   * @returns the container XML
   */
  getContainer: (document) => document.renderTextFile('container'),

  /**
   * Provide the contents of the OPF (spine) file.
   * @param {Object} document - the EPUB document
   * @returns the OPF (spine) content
   */
  getOPF: (document) => document.renderTextFile('opf'),

  /**
   * Provide the contents of the nav document.
   * @param {Object} document - the EPUB document
   * @returns the nav file contents
   */
  getNav: (document) => {
    document.filesForTOC = document.view.tocFiles()
    return document.renderTextFile('nav')
  }

}

module.exports = structural
