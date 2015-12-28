var fs = require("fs"),
	_ = require("underscore"),
	assert = require('assert'),
	expect = require('chai').expect,
	makepub = require("../index"),
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
	includeCopyrightPage: true,
	includeBackMatterPage: true
};

var lipsum = "<p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</em></p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>";

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
			.to.throw(": id");
	});

	it("should throw an exception if no Title", function () {
		expect(function () {
			epub = makepub.document({id: "1", author: "A", cover: 'test-cover.png'})
		})
			.to.throw(": title");
	});

	it("should throw an exception if no Author", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", cover: 'test-cover.png'})
		})
			.to.throw(": author");
	});

	it("should throw an exception if no Cover", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A"})
		})
			.to.throw(": cover");
	});

	it("should throw an exception if a missing/invalid Cover is specified", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A", cover: "test-cover"})
		})
			.to.throw(": cover");
	});

});

describe("Create EPUB with valid document metadata and cover image", function () {

	var epub;

	beforeEach(function () {
		epub = makepub.document(validMetadata);
	});

	it("should not throw an exception when addChapter is called", function () {
		epub.addChapter('title', lipsum);
		expect(true).to.equal(true);
	});

	it("should increase the chapter count when addChapter is called", function () {
		epub.addChapter('title', lipsum);
		expect(epub.chapters.length).to.equal(1);
	});

	it("should return the correct chapter count when getChapterCount is called", function () {
		epub.addChapter('title', lipsum);
		expect(epub.getChapterCount()).to.equal(1);
	});

	it("should provide an EPUB file collection when asked", function () {
		epub.addChapter('title', lipsum);
		expect(function () {
			epub.getFilesForEPUB()
		}).not.to.throw();
	});

	describe("With added content", function () {

		var files = [];

		beforeEach(function () {
			epub = makepub.document(validMetadata);
			epub.addChapter('Chapter 1', lipsum);
			epub.addChapter('Chapter 2', lipsum);
			epub.addChapter('Chapter 3', lipsum);
			files = epub.getFilesForEPUB();
		});

		describe("When the constituent files are requested", function () {

			it("should return the correct number of files", function () {
				expect(files.length).to.equal(13);
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
				expect(fs.writeFileSync.callCount).to.equal(13);
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

describe("Create EPUB with valid document metadata", function () {

	var epub;

	describe("With no copyright page", function () {

		it("should return the correct number of files", function () {
			validMetadata.includeCopyrightPage = false;
			validMetadata.includeBackMatterPage = true;
			epub = makepub.document(validMetadata);
			epub.addChapter('Chapter 1', lipsum);
			epub.addChapter('Chapter 2', lipsum);
			epub.addChapter('Chapter 3', lipsum);
			files = epub.getFilesForEPUB();
			expect(files.length).to.equal(12);
		});

	});

	describe("With no back matter page", function () {

		it("should return the correct number of files", function () {
			validMetadata.includeCopyrightPage = false;
			validMetadata.includeBackMatterPage = false;
			epub = makepub.document(validMetadata);
			epub.addChapter('Chapter 1', lipsum);
			epub.addChapter('Chapter 2', lipsum);
			epub.addChapter('Chapter 3', lipsum);
			files = epub.getFilesForEPUB();
			expect(files.length).to.equal(11);
		});

	});

});
