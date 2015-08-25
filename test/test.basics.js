
var expect = require("chai").expect,
    makepub = require('../index');

describe("The testing framework and assertion library", function() {
  it("should be active", function() {
    expect(true).to.equal(true);
  });
});

describe("Create EPUB with no document metadata", function() {

  var epub;

  beforeEach(function() {
    epub = makepub.document({});
  });

  it("should not throw an exception", function() {
    expect(true).to.equal(true);
  });
  it("should not throw an exception when addChapter is called", function() {
    epub.addChapter('title', 'content');
    expect(true).to.equal(true);
  });
  it("should increase the chapter count when addChapter is called", function() {
    epub.addChapter('title', 'content');
    expect(epub.chapters.length).to.equal(1);
  });
  it("should return the correct chapter count when getChapterCount is called", function() {
    epub.addChapter('title', 'content');
    expect(epub.getChapterCount()).to.equal(1);
  });
  it("should error if EPUB files requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.getFilesForEPUB() } ).to.throw();
  });
  it("should error if EPUB constituent files write requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.writeFilesForEPUB("folder") } ).to.throw();
  });
  it("should error if EPUB final file write requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.writeEPUB("folder","filename", {}, {}) } ).to.throw();
  });
});

