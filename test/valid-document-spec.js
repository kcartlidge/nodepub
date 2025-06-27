const { expect, assert } = require('chai')
const { lipsum, find, validMetadata } = require('./shared')

const nodepub = require('../src/index')

describe('Create EPUB with a valid document', () => {
  let epub

  beforeEach(() => {
    epub = nodepub.document(validMetadata())
  })

  it('should increase the section count when addSection is called', () => {
    epub.addSection('one', lipsum)
    epub.addSection('two', lipsum)

    expect(epub.sections.length).to.equal(2)
  })

  it('should return the correct section count when getSectionCount is called', () => {
    epub.addSection('one', lipsum)
    epub.addSection('two', lipsum)

    expect(epub.getSectionCount()).to.equal(2)
  })

  it('should provide an EPUB file collection when asked', () => {
    epub.addSection('title', lipsum)

    expect(() => {
      epub.getFilesForEPUB(() => { })
    }).not.to.throw()
  })

  it('should include an image file asset', async () => {
    const metadataWithImage = validMetadata()
    metadataWithImage.images.push('test/hat.png')
    epub = nodepub.document(metadataWithImage)

    const files = await epub.getFilesForEPUB()

    const found = find(files, (f) => f.name === 'hat.png')
    assert(found.length > 0)
  })

  it('should not contain duplicate image file assets', async () => {
    const metadataWithImage = validMetadata()
    metadataWithImage.images.push('test/hat.png')
    metadataWithImage.images.push('test/hat.png')
    epub = nodepub.document(metadataWithImage)

    const files = await epub.getFilesForEPUB()

    const found = find(files, (f) => f.name === 'hat.png')
    assert(found.length === 1, `Should be only 1 instance of an image, but was ${found.length}`)
  })
})
