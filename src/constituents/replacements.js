const moment = require('moment')

/**
 * Replace a single tag (all occurrences).
 * @param {String} original - text to replace the tag within
 * @param {String} tag - the tag to look for
 * @param {String} value - the value to replace it with
 * @returns
 */
const tagReplace = (original, tag, value) => {
  const fullTag = `[[${tag}]]`
  return original.split(fullTag).join(value || '')
}

/**
 * Action all supported tag replacements in some text.
 * @param {Object} document - the EPUB document (needed for the metadata values)
 * @param {String} original - the text to apply all the replacements to
 * @returns the text with the replacements actioned
 */
const replacements = (document, original) => {
  const modified = moment().format('YYYY-MM-DD')
  let result = original
  result = tagReplace(result, 'EOL', '\n')
  result = tagReplace(result, 'COVER', document.metadata.cover)
  result = tagReplace(result, 'ID', document.metadata.id)
  result = tagReplace(result, 'TITLE', document.metadata.title)
  result = tagReplace(result, 'SERIES', document.metadata.series)
  result = tagReplace(result, 'SEQUENCE', document.metadata.sequence)
  result = tagReplace(result, 'COPYRIGHT', document.metadata.copyright)
  result = tagReplace(result, 'LANGUAGE', document.metadata.language)
  result = tagReplace(result, 'FILEAS', document.metadata.fileAs)
  result = tagReplace(result, 'AUTHOR', document.metadata.author)
  result = tagReplace(result, 'PUBLISHER', document.metadata.publisher)
  result = tagReplace(result, 'DESCRIPTION', document.metadata.description)
  result = tagReplace(result, 'PUBLISHED', document.metadata.published)
  result = tagReplace(result, 'GENRE', document.metadata.genre)
  result = tagReplace(result, 'TAGS', document.metadata.tags)
  result = tagReplace(result, 'CONTENTS', document.metadata.contents)
  result = tagReplace(result, 'SOURCE', document.metadata.source)
  result = tagReplace(result, 'MODIFIED', modified)
  return result
}

module.exports = replacements
