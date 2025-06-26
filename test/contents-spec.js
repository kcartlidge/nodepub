const { expect, assert } = require('chai')
const { lipsum, find, validMetadata, findFirstContent } = require('./shared')

const nodepub = require('../src/index')

describe('Handling EPUB contents', () => {
  let epub
  let providedContents = false

  const contentsCallback = () => {
    providedContents = true
  }

  beforeEach(() => {
    epub = nodepub.document(validMetadata())
  })

  it('should request contents markup when needed', async () => {
    epub = nodepub.document(validMetadata(), contentsCallback)
    epub.addSection('Dummy Section.', lipsum)

    await epub.getFilesForEPUB()

    expect(providedContents).to.equal(true)
  })

  it('should have a `toc` when the contents page is not skipped', async () => {
    epub = nodepub.document(validMetadata())
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()

    const metadata = find(files, (f) => f.name === 'toc.xhtml')
    assert(metadata.length === 1, 'Expected a table of contents (toc)')
  })

  it('should not have a `toc` when the contents page is skipped', async () => {
    const metadataNoContents = validMetadata()
    metadataNoContents.showContents = false
    epub = nodepub.document(metadataNoContents)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()

    const metadata = find(files, (f) => f.name === 'toc.xhtml')
    assert(metadata.length === 0, 'Expected not to find a table of contents (toc)')
  })

  describe('With a section excluded from the contents', () => {
    let files = []

    beforeEach(async () => {
      epub = nodepub.document(validMetadata())
      epub.addSection('Copyright', '<h1>Copyright Page</h1>', true, true)
      epub.addSection('Chapter 1', lipsum)
      epub.addSection('Chapter 2', lipsum)
      epub.addSection('Chapter 3', lipsum)
      files = await epub.getFilesForEPUB()
    })

    it('should return the correct number of files', async () => {
      expect(files.length).to.equal(12)
    })

    it('should NOT show the section in the NCX contents metadata', async () => {
      const ncxContent = findFirstContent(files, (f) => f.name === 'navigation.ncx', '>Copyright<')
      const copyrightPageInNCX = ncxContent.indexOf('>Copyright<') > -1

      expect(copyrightPageInNCX).to.equal(false)
    })

    it('should NOT show the section in the HTML contents area', async () => {
      const tocContent = findFirstContent(files, (f) => f.name === 'toc.xhtml', '>Copyright<')
      const copyrightPageInTOC = tocContent.indexOf('Copyright') > -1

      expect(copyrightPageInTOC).to.equal(false)
    })

    describe('With the excluded section being front-matter', () => {
      it('should place the section before the HTML contents page', async () => {
        const opfContent = findFirstContent(files, (f) => f.name === 'ebook.opf')
        const copyrightPageInOPF = opfContent.indexOf("<itemref idref='s1' />")
        const contentsPageInOPF = opfContent.indexOf("<itemref idref='toc'/>")

        expect(copyrightPageInOPF).to.be.lessThan(contentsPageInOPF)
      })
    })
  })
})
