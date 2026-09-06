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
   * Provide the contents of the NCX file.
   * @param {Object} document - the EPUB document
   * @returns the NCX file contents
   */
  getNCX: (document) => {
    document.filesForTOC = document.view.tocFiles()
    return document.renderTextFile('ncx')
  }

}

module.exports = structural
