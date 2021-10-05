const fs = require('fs');
const fsPromises = require('fs').promises;
const { expect, assert } = require('chai');
const sinon = require('sinon');

const nodepub = require('../src/index');

const lipsum = '<h1>Chapter Title Goes Here</h1><p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</em></p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>';

const find = (collection, condition) => {
  const result = [];
  collection.forEach((f) => {
    if (condition(f)) result.push(f);
  });
  return result;
};

describe('Create EPUB with invalid document metadata', () => {
  it('should throw an exception if null', () => {
    expect(() => {
      nodepub.document();
    }).to.throw('Missing metadata');
  });

  it('should throw an exception if no ID', () => {
    expect(() => {
      nodepub.document({
        title: 'T', author: 'A', genre: 'Non-Fiction', cover: 'cover.png',
      });
    }).to.throw(': id');
  });

  it('should throw an exception if no Title', () => {
    expect(() => {
      nodepub.document({
        id: '1', author: 'A', genre: 'Non-Fiction', cover: 'cover.png',
      });
    }).to.throw(': title');
  });

  it('should throw an exception if no Author', () => {
    expect(() => {
      nodepub.document({
        id: '1', title: 'T', genre: 'Non-Fiction', cover: 'cover.png',
      });
    }).to.throw(': author');
  });

  it('should throw an exception if no Cover', () => {
    expect(() => {
      nodepub.document({
        id: '1', title: 'T', author: 'A', genre: 'Non-Fiction',
      });
    }).to.throw(': cover');
  });
});

describe('Create EPUB with a valid document', () => {
  let validMetadata;
  let epub;

  beforeEach(() => {
    validMetadata = {
      id: Date.now(),
      cover: 'test/test-cover.png',
      title: 'Test Document',
      series: 'My Series',
      sequence: 1,
      author: 'Nodepub',
      fileAs: 'Nodepub',
      genre: 'Non-Fiction',
      tags: 'Sample,Example,Test',
      copyright: 'Nodepub, 1980',
      publisher: 'My Fake Publisher',
      published: '2000-12-31',
      language: 'en',
      description: 'A test book.',
      contents: 'Contents',
      source: 'http://www.kcartlidge.com',
      images: [],
    };
    epub = nodepub.document(validMetadata);
  });

  it('should not throw an exception when addSection is called', () => {
    epub.addSection('title', lipsum);
    expect(true).to.equal(true);
  });

  it('should increase the chapter count when addSection is called', () => {
    epub.addSection('title', lipsum);
    expect(epub.sections.length).to.equal(1);
  });

  it('should return the correct chapter count when getChapterCount is called', () => {
    epub.addSection('title', lipsum);
    expect(epub.getSectionCount()).to.equal(1);
  });

  it('should provide an EPUB file collection when asked', () => {
    epub.addSection('title', lipsum);
    expect(() => {
      epub.getFilesForEPUB(() => { });
    }).not.to.throw();
  });

  it('should include an image file asset', (done) => {
    validMetadata.images.push('test/hat.png');
    epub = nodepub.document(validMetadata);
    epub.getFilesForEPUB()
      .then((files) => {
        let found = false;
        files.forEach((f) => {
          if (f.name === 'hat.png') {
            found = true;
          }
        });
        assert(found);
        done();
      });
  });

  describe('With a generate contents callback provided', () => {
    let providedContents = false;
    const contentsCallback = () => {
      providedContents = true;
    };

    it('should request contents markup when needed', (done) => {
      epub = nodepub.document(validMetadata, contentsCallback);
      epub.addSection('Dummy Section.', lipsum);
      epub.getFilesForEPUB()
        .then(() => {
          expect(providedContents).to.equal(true);
          done();
        });
    });
  });

  describe('With added content', () => {
    let files = [];

    beforeEach(async () => {
      epub = nodepub.document(validMetadata);
      epub.addSection('Chapter 1', lipsum);
      epub.addSection('Chapter 2', lipsum);
      epub.addSection('Chapter 3', lipsum, false, false, 'chapter-3');
      files = await epub.getFilesForEPUB();
    });

    describe('When the constituent files are requested', () => {
      it('should return the correct number of files', () => {
        expect(files.length).to.equal(11);
      });

      it('should have a mimetype file', () => {
        const metadata = find(files, (f) => f.name === 'mimetype');
        assert(metadata !== null);
      });

      it('should have an uncompressed mimetype file', () => {
        const metadata = find(files, (f) => f.name === 'mimetype');
        expect(metadata[0].compress).to.equal(false);
      });

      it('should have all other files compressed', () => {
        const metadata = find(files, (f) => f.name !== 'mimetype' && f.compress === false);
        assert(metadata.length === 0);
      });

      it('should have the correct filename when a section overrides it', () => {
        const metadata = find(files, (f) => f.name === 'chapter-3.xhtml');
        assert(metadata.length === 1, 'Expected a renamed section');
      });
    });

    describe('When the constituent files are to be written to a folder', () => {
      let stubMkdir;
      let stubWrite;

      beforeEach(() => {
        stubMkdir = sinon.stub(fsPromises, 'mkdir').resolves(() => { });
        stubWrite = sinon.stub(fsPromises, 'writeFile').resolves(() => { });
      });
      afterEach(() => {
        stubWrite.restore();
        stubMkdir.restore();
      });

      it('Should attempt to create subfolders', async () => {
        await epub.writeFilesForEPUB('test/test');
        expect(fsPromises.mkdir.callCount).to.equal(11);
      });

      it('Should attempt to write the correct quantity of files', async () => {
        await epub.writeFilesForEPUB('test/test');
        expect(fsPromises.writeFile.callCount).to.equal(11);
      });
    });

    describe('When writing the final EPUB is requested', () => {
      beforeEach(() => {
        try {
          fs.unlinkSync('test/test-book.epub');
        } catch (e) {
          // Ignore error when it does not already exist
        }
      });

      it('the file should now exist', async () => {
        await epub.writeEPUB('test', 'test-book');
        const result = fs.statSync('test/test-book.epub').isFile();
        expect(result).to.equal(true);
      });
    });

    describe('With a section excluded from the contents', () => {
      beforeEach(async () => {
        epub = nodepub.document(validMetadata);
        epub.addSection('Copyright', '<h1>Copyright Page</h1>', true, true);
        epub.addSection('Chapter 1', lipsum);
        epub.addSection('Chapter 2', lipsum);
        epub.addSection('Chapter 3', lipsum);
        files = await epub.getFilesForEPUB();
      });

      it('should return the correct number of files', async () => {
        files = await epub.getFilesForEPUB();
        expect(files.length).to.equal(12);
      });

      it('should not show the section in the NCX contents metadata', async () => {
        files = await epub.getFilesForEPUB();
        let ncxContent = '>Copyright<';
        files.forEach((f) => {
          if (f.name === 'navigation.ncx') {
            ncxContent = f.content;
          }
        });
        const copyrightPageInNCX = ncxContent.indexOf('>Copyright<') > -1;
        expect(copyrightPageInNCX).to.equal(false);
      });

      it('should not show the section in the HTML contents area', async () => {
        files = await epub.getFilesForEPUB();
        let tocContent = '>Copyright<';
        files.forEach((f) => {
          if (f.name === 'toc.xhtml') {
            tocContent = f.content;
          }
        });
        const copyrightPageInTOC = tocContent.indexOf('Copyright') > -1;
        expect(copyrightPageInTOC).to.equal(false);
      });

      describe('With the excluded section being front-matter', () => {
        it('should place the section before the HTML contents page', async () => {
          files = await epub.getFilesForEPUB();
          let opfContent = '';
          files.forEach((f) => {
            if (f.name === 'ebook.opf') {
              opfContent = f.content;
            }
          });
          const copyrightPageInOPF = opfContent.indexOf("<itemref idref='s1' />");
          const contentsPageInOPF = opfContent.indexOf("<itemref idref='toc'/>");
          expect(copyrightPageInOPF).to.be.lessThan(contentsPageInOPF);
        });
      });
    });
  });
});
