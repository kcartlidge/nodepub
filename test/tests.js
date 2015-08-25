
var expect = require("chai").expect, makepub = require('../index');

var validMetadata = {
	id: '12345678',
	title: 'Unnamed Document',
	series: 'My Series',
	sequence: 2,
	author: 'Anonymous',
	fileAs: 'Anonymous',
	genre: 'Non-Fiction',
	tags: 'Sample,Example,Test',
	copyright: 'Anonymous, 1980',
	publisher: 'My Fake Publisher',
	published: '2000-12-31',
	language: 'en',
	cover: 'sample-cover.png',
	description: 'A sample book.',
	thanks: "Thanks for reading <em>[[TITLE]]</em>. If you enjoyed it please consider leaving a review where you purchased it.",
	linkText: "See more books and register for special offers here.",
	bookPage: "https://github.com/kcartlidge/node-makepub",
	showChapterNumbers: true,
	includeCopyrightPage: true
};

describe("The testing framework and assertion library", function() {
  it("should be active", function() {
    expect(true).to.equal(true);
  });
});

describe("Create EPUB with invalid document metadata", function() {

  it("should throw an exception if null", function() {
    expect( function() { epub = makepub.document() } ).to.throw("Missing metadata");
  });

  it("should throw an exception if no ID", function() {
    expect( function() { epub = makepub.document({title:"T",author:"A",cover:'sample-cover.png'}) } )
    .to.throw(": ID");
  });

  it("should throw an exception if no Title", function() {
    expect( function() { epub = makepub.document({id:"1",author:"A",cover:'sample-cover.png'}) } )
    .to.throw(": Title");
  });

  it("should throw an exception if no Author", function() {
    expect( function() { epub = makepub.document({id:"1",title:"T",cover:'sample-cover.png'}) } )
    .to.throw(": Author");
  });

  it("should throw an exception if no Cover", function() {
    expect( function() { epub = makepub.document({id:"1",title:"T",author:"A"}) } )
    .to.throw(": Cover");
  });

  it("should throw an exception if a missing/invalid Cover is specified", function() {
    expect( function() { epub = makepub.document({id:"1",title:"T",author:"A",cover:"sample-cover"}) } )
    .to.throw(": Cover");
  });

});

describe("Create EPUB with valid document metadata and cover image", function() {

  var epub;

  beforeEach(function() {
    epub = makepub.document( validMetadata );
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

  it("should not error if EPUB files requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.getFilesForEPUB() } ).not.to.throw();
  });

  it("should not error if EPUB constituent files write requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.writeFilesForEPUB("test/sample") } ).not.to.throw();
  });

  it("should not error if EPUB final file write requested", function() {
    epub.addChapter('title', 'content');
    expect( function() { epub.writeEPUB("test/sample","filename", {}, {}) } ).not.to.throw();
  });
});

