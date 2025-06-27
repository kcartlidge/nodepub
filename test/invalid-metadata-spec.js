const { expect } = require('chai')

const nodepub = require('../src/index')

describe('Create EPUB with invalid document metadata', () => {
  it('should throw an exception if null', () => {
    expect(() => {
      nodepub.document()
    }).to.throw('Missing metadata')
  })

  it('should throw an exception if no ID', () => {
    expect(() => {
      nodepub.document({
        title: 'T', author: 'A', genre: 'Non-Fiction', cover: 'cover.png'
      })
    }).to.throw(': id')
  })

  it('should throw an exception if no Title', () => {
    expect(() => {
      nodepub.document({
        id: '1', author: 'A', genre: 'Non-Fiction', cover: 'cover.png'
      })
    }).to.throw(': title')
  })

  it('should throw an exception if no Author', () => {
    expect(() => {
      nodepub.document({
        id: '1', title: 'T', genre: 'Non-Fiction', cover: 'cover.png'
      })
    }).to.throw(': author')
  })

  it('should throw an exception if no Cover', () => {
    expect(() => {
      nodepub.document({
        id: '1', title: 'T', author: 'A', genre: 'Non-Fiction'
      })
    }).to.throw(': cover')
  })
})
