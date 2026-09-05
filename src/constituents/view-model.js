const path = require('path')
const moment = require('moment')
const util = require('../utility.js')

const METADATA_FIELDS = [
  'id',
  'cover',
  'title',
  'series',
  'sequence',
  'author',
  'fileAs',
  'genre',
  'tags',
  'copyright',
  'publisher',
  'published',
  'language',
  'description',
  'contents',
  'source',
  'images'
]

const FLAG_FIELDS = [
  'addInternalCover',
  'appendSeriesToTitle',
  'showContents'
]

const missing = (value) => value == null || typeof value === 'undefined' || value.toString().trim() === ''

const defaultFor = (name) => {
  if (name === 'images') return []
  if (name === 'contents') return 'Contents'
  return ''
}

/**
 * Build the flat view model used by every EJS template.
 * Copies known constructor fields only; extra metadata keys are dropped
 * so effectively it's an allow-listed copy.
 * @param {Object} document - the EPUB document instance
 * @returns {Object} named top-level fields plus sections/css/helpers
 */
const createViewModel = (document) => {
  const metadata = document.metadata || {}
  const view = {}

  METADATA_FIELDS.forEach((name) => {
    if (name === 'images') {
      view.images = Array.isArray(metadata.images) ? metadata.images : []
      return
    }
    view[name] = missing(metadata[name]) ? defaultFor(name) : metadata[name]
  })

  FLAG_FIELDS.forEach((name) => {
    view[name] = document[name]
  })

  view.sections = document.sections
  view.css = document.CSS
  view.mimetype = 'application/epub+zip'
  view.modified = moment().format('YYYY-MM-DD')
  view.currentSection = null
  view.overrideContents = null

  view.imageName = (filename) => path.basename(filename || '')
  view.imageType = (filename) => util.getImageType(filename)
  view.tocEntries = () => view.sections.filter((section) => !section.excludeFromContents)
  view.tocFiles = () => {
    const files = []
    view.sections.forEach((section) => {
      if (!section.excludeFromContents && section.isFrontMatter) {
        files.push({ title: section.title, link: `${section.filename}`, itemType: 'front' })
      }
    })
    if (view.showContents) {
      files.push({ title: view.contents, link: 'toc.xhtml', itemType: 'contents' })
    }
    view.sections.forEach((section) => {
      if (!section.excludeFromContents && !section.isFrontMatter) {
        files.push({ title: section.title, link: `${section.filename}`, itemType: 'main' })
      }
    })
    return files
  }
  view.navPoints = () => {
    const points = []
    let playOrder = 1
    if (view.addInternalCover) {
      points.push({
        id: 'cover', className: '', playOrder: playOrder++, label: 'Cover', src: 'cover.xhtml'
      })
    }
    view.sections.forEach((section, idx) => {
      if (section.excludeFromContents || !section.isFrontMatter) return
      points.push({
        id: `s${idx + 1}`,
        className: 'section',
        playOrder: playOrder++,
        label: section.title,
        src: `content/${section.filename}`
      })
    })
    if (view.showContents) {
      points.push({
        id: 'toc', className: 'toc', playOrder: playOrder++, label: view.contents, src: 'content/toc.xhtml'
      })
    }
    view.sections.forEach((section, idx) => {
      if (section.excludeFromContents || section.isFrontMatter) return
      points.push({
        id: `s${idx + 1}`,
        className: 'section',
        playOrder: playOrder++,
        label: section.title,
        src: `content/${section.filename}`
      })
    })
    return points
  }

  return view
}

module.exports = { createViewModel }
