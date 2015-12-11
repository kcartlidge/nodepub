var fs = require("fs"),
	assert = require('assert'),
	expect = require('chai').expect,
	makepub = require("../index"),
	_ = require("underscore"),
	sinon = require("sinon");

var validMetadata = {
	id: '12345678',
	title: 'Unnamed Document',
	series: 'My Series',
	sequence: 1,
	author: 'Anonymous',
	fileAs: 'Anonymous',
	genre: 'Non-Fiction',
	tags: 'Sample,Example,Test',
	copyright: 'Anonymous, 1980',
	publisher: 'My Fake Publisher',
	published: '2000-12-31',
	language: 'en',
	cover: 'test/test-cover.png',
	description: 'A test book.',
	thanks: "Thanks for reading <em>[[TITLE]]</em>. If you enjoyed it please consider leaving a review where you purchased it.",
	linkText: "See more books and register for special offers here.",
	bookPage: "https://github.com/kcartlidge/node-makepub",
	showChapterNumbers: true,
	includeCopyrightPage: true
};

describe("Create EPUB with invalid document metadata", function () {

	it("should throw an exception if null", function () {
		expect(function () {
			epub = makepub.document()
		}).to.throw("Missing metadata");
	});

	it("should throw an exception if no ID", function () {
		expect(function () {
			epub = makepub.document({title: "T", author: "A", cover: 'test-cover.png'})
		})
			.to.throw(": ID");
	});

	it("should throw an exception if no Title", function () {
		expect(function () {
			epub = makepub.document({id: "1", author: "A", cover: 'test-cover.png'})
		})
			.to.throw(": Title");
	});

	it("should throw an exception if no Author", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", cover: 'test-cover.png'})
		})
			.to.throw(": Author");
	});

	it("should throw an exception if no Cover", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A"})
		})
			.to.throw(": Cover");
	});

	it("should throw an exception if a missing/invalid Cover is specified", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A", cover: "test-cover"})
		})
			.to.throw(": Cover");
	});

});

describe("Create EPUB with valid document metadata and cover image", function () {

	var epub;

	beforeEach(function () {
		epub = makepub.document(validMetadata);
	});

	it("should not throw an exception when addChapter is called", function () {
		epub.addChapter('title', 'content');
		expect(true).to.equal(true);
	});

	it("should increase the chapter count when addChapter is called", function () {
		epub.addChapter('title', 'content');
		expect(epub.chapters.length).to.equal(1);
	});

	it("should return the correct chapter count when getChapterCount is called", function () {
		epub.addChapter('title', 'content');
		expect(epub.getChapterCount()).to.equal(1);
	});

	it("should not error if EPUB files requested", function () {
		epub.addChapter('title', 'content');
		expect(function () {
			epub.getFilesForEPUB()
		}).not.to.throw();
	});

	it("should not error if EPUB constituent files write requested", function () {
		epub.addChapter('title', 'content');
		expect(function () {
			epub.writeFilesForEPUB("test/test")
		}).not.to.throw();
	});

	it("should not error if EPUB final file write requested", function (done) {
		epub.addChapter('title', 'content');
		expect(function () {
			epub.writeEPUB({}, "test", "test-book", function () {
				done();
			})
		}).not.to.throw();
	});

	describe("With added content", function () {

		var files = [];

		beforeEach(function () {
			epub = makepub.document(validMetadata);
			epub.addChapter('title', 'content');
			files = epub.getFilesForEPUB();
		});

		describe("When the constituent files are requested", function () {

			it("should return the correct number of files", function () {
				expect(files.length).to.equal(11);
			});

			it("should have a mimetype file", function () {
				var metadata = _.find(files, function (f) {
					return f.name == 'mimetype'
				});
				expect(metadata).not.to.be.null;
			});

			it("should have an uncompressed mimetype file", function () {
				var metadata = _.find(files, function (f) {
					return f.name == 'mimetype'
				});
				expect(metadata.compress).to.equal(false);
			});

			it("should have all other files compressed", function () {
				var metadata = _.find(files, function (f) {
					return f.name != 'mimetype' && f.compress == false
				});
				expect(metadata).to.be.undefined;
			});

		});

		describe("When the constituent files are to be written to a folder", function () {
			var stubMkdir, stubWrite, expectation;

			beforeEach(function () {
				stubMkdir = sinon.stub(fs, "mkdirSync");
				stubWrite = sinon.stub(fs, "writeFileSync");
			});
			afterEach(function () {
				stubWrite.restore();
				stubMkdir.restore();
			});

			it("Should attempt to create a subfolder", function () {
				epub.writeFilesForEPUB("test/test");
				expect(fs.mkdirSync.callCount).to.equal(2);
			});

			it("Should attempt to write the correct quantity of files", function () {
				epub.writeFilesForEPUB("test/test");
				expect(fs.writeFileSync.callCount).to.equal(11);
			});

		});

		describe("When a final EPUB is requested", function () {

			beforeEach(function () {
				try {
					fs.unlink('test/test-book.epub');
				} catch (e) {
				}
			});

			it("the file should now exist", function (done) {
				expect(function () {
					epub.writeEPUB({}, "test", "test-book", function () {
						try {
							var result = fs.statSync('test/test-book.epub').isFile();
							if (!result) throw new Error("EPUB not created or not a File.");
						} catch (e) {
							throw new Error("EPUB not created.");
						}
						done();
					})
				}).not.to.throw();
			});

		});

	});

});
