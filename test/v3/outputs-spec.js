const fs = require('fs')
const fsPromises = require('fs').promises
const { expect, assert } = require('chai')
const sinon = require('sinon')
const { lipsum, find, validMetadata: sharedValidMetadata } = require('../shared')

const nodepub = require('../../src/index')

const validMetadata = () => {
  const metadata = sharedValidMetadata()
  metadata.epubVersion = 3
  return metadata
}

describe('Generating EPUB outputs (epubVersion 3)', () => {
  let epub
  let files = []

  beforeEach(async () => {
    epub = nodepub.document(validMetadata())
    epub.addSection('Chapter 1', `${lipsum}<p>&copy;&nbsp;Sample.</p>`)
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

    it('should have a mimetype file whose content is application/epub+zip', () => {
      const mimetype = find(files, (f) => f.name === 'mimetype')
      expect(mimetype[0].content).to.equal('application/epub+zip')
    })

    it('should have mimetype as the first file', () => {
      expect(files[0].name).to.equal('mimetype')
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

    it('should have a nav document and no NCX', () => {
      const nav = find(files, (f) => f.name === 'nav.xhtml')
      const ncx = find(files, (f) => f.name === 'navigation.ncx')
      assert(nav.length === 1, 'Expected a nav document')
      assert(ncx.length === 0, 'Expected no NCX')
    })

    it('should have an EPUB 3 package document', () => {
      const opfContent = files.find((f) => f.name === 'ebook.opf').content
      expect(opfContent).to.contain("version='3.0'")
      expect(opfContent).to.contain("property='dcterms:modified'")
      expect(opfContent).to.contain("properties='nav'")
      expect(opfContent).to.contain("properties='cover-image'")
    })

    it('should use the HTML profile for content documents', () => {
      const section = files.find((f) => f.name === 's1.xhtml').content
      expect(section).to.not.contain('XHTML 1.1')
      expect(section).to.contain("xml:lang='en'")
      expect(section).to.contain("lang='en'")
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
        fs.unlinkSync('test/test-book-v3.epub')
      } catch (e) {
        // Ignore error if it doesn't already exist
      }
    })

    it('the file should now exist in the filesystem', async () => {
      await epub.writeEPUB('test', 'test-book-v3')

      const result = fs.statSync('test/test-book-v3.epub').isFile()
      expect(result).to.equal(true)
    })

    it('should start with an uncompressed mimetype ZIP local-file header and payload', async () => {
      await epub.writeEPUB('test', 'test-book-v3')

      const fd = fs.openSync('test/test-book-v3.epub', 'r')
      const prefix = Buffer.alloc(58)
      const bytesRead = fs.readSync(fd, prefix, 0, 58, 0)
      fs.closeSync(fd)

      expect(bytesRead).to.equal(58)
      expect(prefix.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))).to.equal(true)
      expect(prefix[8]).to.equal(0x00)
      expect(prefix[9]).to.equal(0x00)
      expect(prefix.subarray(14, 18).equals(Buffer.from([0x6f, 0x61, 0xab, 0x2c]))).to.equal(true)
      expect(prefix.subarray(18, 22).equals(Buffer.from([0x14, 0x00, 0x00, 0x00]))).to.equal(true)
      expect(prefix.subarray(22, 26).equals(Buffer.from([0x14, 0x00, 0x00, 0x00]))).to.equal(true)
      expect(prefix.subarray(26, 28).equals(Buffer.from([0x08, 0x00]))).to.equal(true)
      expect(prefix.subarray(28, 30).equals(Buffer.from([0x00, 0x00]))).to.equal(true)
      expect(prefix.subarray(30, 38).equals(Buffer.from('mimetype'))).to.equal(true)
      expect(prefix.subarray(38, 58).equals(Buffer.from('application/epub+zip'))).to.equal(true)
    })
  })
})
