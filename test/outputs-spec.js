const fs = require('fs')
const fsPromises = require('fs').promises
const { expect, assert } = require('chai')
const sinon = require('sinon')
const { lipsum, find, validMetadata } = require('./shared')

const nodepub = require('../src/index')

describe('Generating EPUB outputs', () => {
  let epub
  let files = []

  beforeEach(async () => {
    epub = nodepub.document(validMetadata())
    epub.addSection('Chapter 1', lipsum)
    epub.addSection('Chapter 2', lipsum)
    epub.addSection('Chapter 3', lipsum, false, false, 'chapter-3')
    files = await epub.getFilesForEPUB()
  })

  describe('When the constituent files are requested', () => {
    it('should return the correct number of files', () => {
      expect(files.length).to.equal(11)
    })

    it('should have a mimetype file', () => {
      const metadata = find(files, (f) => f.name === 'mimetype')
      assert(metadata !== null)
    })

    it('should have an uncompressed mimetype file', () => {
      const metadata = find(files, (f) => f.name === 'mimetype')
      expect(metadata[0].compress).to.equal(false)
    })

    it('should have all non-mimetype files compressed', () => {
      const metadata = find(files, (f) => f.name !== 'mimetype' && f.compress === false)
      assert(metadata.length === 0)
    })

    it('should have the correct filename when a section overrides it', () => {
      const metadata = find(files, (f) => f.name === 'chapter-3.xhtml')
      assert(metadata.length === 1, 'Expected a renamed section')
    })
  })

  describe('When the constituent files are to be written to a folder', () => {
    let stubMkdir
    let stubWrite

    beforeEach(() => {
      stubMkdir = sinon.stub(fsPromises, 'mkdir').resolves(() => { })
      stubWrite = sinon.stub(fsPromises, 'writeFile').resolves(() => { })
    })
    afterEach(() => {
      stubWrite.restore()
      stubMkdir.restore()
    })

    it('Should attempt to create subfolders', async () => {
      await epub.writeFilesForEPUB('test/test')

      expect(fsPromises.mkdir.callCount).to.equal(11)
    })

    it('Should attempt to write the correct quantity of files', async () => {
      await epub.writeFilesForEPUB('test/test')

      expect(fsPromises.writeFile.callCount).to.equal(11)
    })
  })

  describe('When writing the final EPUB is requested', () => {
    beforeEach(() => {
      try {
        // Clear the output of other runs
        fs.unlinkSync('test/test-book.epub')
      } catch (e) {
        // Ignore error if it doesn't already exist
      }
    })

    it('the file should now exist in the filesystem', async () => {
      await epub.writeEPUB('test', 'test-book')

      const result = fs.statSync('test/test-book.epub').isFile()
      expect(result).to.equal(true)
    })
  })
})
