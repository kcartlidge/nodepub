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

  it('should default the contents title when contents metadata is missing', async () => {
    const metadata = validMetadata()
    delete metadata.contents
    epub = nodepub.document(metadata)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const toc = findFirstContent(files, (f) => f.name === 'toc.xhtml')
    const ncx = findFirstContent(files, (f) => f.name === 'navigation.ncx')

    expect(toc).to.contain('<h1>Contents</h1>')
    expect(ncx).to.contain('<navLabel><text>Contents</text></navLabel>')
  })

  it('should default the contents title when contents metadata is empty, whitespace, or null', async () => {
    for (const contents of ['', '   ', null]) {
      const metadata = validMetadata()
      metadata.contents = contents
      epub = nodepub.document(metadata)
      epub.addSection('Chapter 1', lipsum)

      const files = await epub.getFilesForEPUB()
      const toc = findFirstContent(files, (f) => f.name === 'toc.xhtml')
      const ncx = findFirstContent(files, (f) => f.name === 'navigation.ncx')

      expect(toc).to.contain('<h1>Contents</h1>')
      expect(ncx).to.contain('<navLabel><text>Contents</text></navLabel>')
    }
  })

  it('should keep an explicit contents title', async () => {
    const metadata = validMetadata()
    metadata.contents = 'Chapters'
    epub = nodepub.document(metadata)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const toc = findFirstContent(files, (f) => f.name === 'toc.xhtml')
    const ncx = findFirstContent(files, (f) => f.name === 'navigation.ncx')

    expect(toc).to.contain('<h1>Chapters</h1>')
    expect(toc).to.not.contain('<h1>Contents</h1>')
    expect(ncx).to.contain('<navLabel><text>Chapters</text></navLabel>')
    expect(ncx).to.not.contain('<navLabel><text>Contents</text></navLabel>')
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

  it('should append series details to the title when appendSeriesToTitle is true', async () => {
    const metadataWithSeriesTitle = validMetadata()
    metadataWithSeriesTitle.appendSeriesToTitle = true
    epub = nodepub.document(metadataWithSeriesTitle)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const opfContent = findFirstContent(files, (f) => f.name === 'ebook.opf')

    expect(opfContent.indexOf('<dc:title>Test Document (My Series #1)</dc:title>') > -1).to.equal(true)
  })

  it('should omit the series suffix from the title when appendSeriesToTitle is false', async () => {
    const metadataNoSeriesTitle = validMetadata()
    metadataNoSeriesTitle.appendSeriesToTitle = false
    epub = nodepub.document(metadataNoSeriesTitle)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const opfContent = findFirstContent(files, (f) => f.name === 'ebook.opf')

    expect(opfContent.indexOf('<dc:title>Test Document</dc:title>') > -1).to.equal(true)
    expect(opfContent.indexOf('<dc:title>Test Document (My Series #1)</dc:title>') > -1).to.equal(false)
    expect(opfContent.indexOf("name='calibre:series'") > -1).to.equal(true)
  })

  it('should have a cover page when addInternalCover is omitted', async () => {
    epub = nodepub.document(validMetadata())
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()

    const cover = find(files, (f) => f.name === 'cover.xhtml')
    assert(cover.length === 1, 'Expected an embedded cover page')
  })

  it('should have a cover page when addInternalCover is true', async () => {
    const metadataWithCover = validMetadata()
    metadataWithCover.addInternalCover = true
    epub = nodepub.document(metadataWithCover)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const opfContent = findFirstContent(files, (f) => f.name === 'ebook.opf')
    const ncxContent = findFirstContent(files, (f) => f.name === 'navigation.ncx')

    const cover = find(files, (f) => f.name === 'cover.xhtml')
    assert(cover.length === 1, 'Expected an embedded cover page')
    expect(opfContent.indexOf("idref='cover'") > -1).to.equal(true)
    expect(ncxContent.indexOf('cover.xhtml') > -1).to.equal(true)
  })

  it('should omit the in-book cover page when addInternalCover is false', async () => {
    const metadataNoCover = validMetadata()
    metadataNoCover.addInternalCover = false
    epub = nodepub.document(metadataNoCover)
    epub.addSection('Chapter 1', lipsum)

    const files = await epub.getFilesForEPUB()
    const opfContent = findFirstContent(files, (f) => f.name === 'ebook.opf')
    const ncxContent = findFirstContent(files, (f) => f.name === 'navigation.ncx')

    const coverPage = find(files, (f) => f.name === 'cover.xhtml')
    assert(coverPage.length === 0, 'Expected not to find an embedded cover page')

    expect(opfContent.indexOf("name='cover'") > -1).to.equal(true)
    expect(opfContent.indexOf("id='cover-image'") > -1).to.equal(true)
    const coverImage = find(files, (f) => f.name === 'test-cover.png')
    assert(coverImage.length === 1, 'Expected the cover image file to remain')

    expect(opfContent.indexOf("idref='cover'") > -1).to.equal(false)
    expect(ncxContent.indexOf('cover.xhtml') > -1).to.equal(false)
  })

  describe('With a section having a filename override', () => {
    let files = []

    beforeEach(async () => {
      epub = nodepub.document(validMetadata())
      epub.addSection('Copyright', '<h1>Copyright Page</h1>', true, true)
      epub.addSection('Chapter 1', lipsum)
      epub.addSection('Chapter 2', lipsum)
      epub.addSection('Chapter 3', lipsum, false, false, 'chapter-3')
    })

    it('should have the new filename for the section in the TOC', async () => {
      files = await epub.getFilesForEPUB()

      const originalFilename = 's' + epub.getSectionCount() + '.xhtml'
      const tocContent = findFirstContent(files, (f) => f.name === 'toc.xhtml')
      const autoFilenameInNCX = tocContent.indexOf(originalFilename) > -1
      const manualFilenameInNCX = tocContent.indexOf('chapter-3.xhtml') > -1
      expect(autoFilenameInNCX).to.equal(false, `Still has original filename (${originalFilename})`)
      expect(manualFilenameInNCX).to.equal(true, 'Should have filename overridden')
    })
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
