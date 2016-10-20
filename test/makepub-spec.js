var fs = require("fs"),
	_ = require("underscore"),
	expect = require('chai').expect,
	sinon = require("sinon"),
	makepub = require("../index");

var validMetadata = {
	id: Date.now(),
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
	images: []
};
var lipsum = "<h1>Chapter Title Goes Here</h1><p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</em></p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>";

describe("Create EPUB with invalid document metadata", function () {

	var epub;
	it("should throw an exception if null", function () {
		expect(function () {
			epub = makepub.document()
		}).to.throw("Missing metadata");
	});

	it("should throw an exception if no ID", function () {
		expect(function () {
			epub = makepub.document({title: "T", author: "A", genre: 'Non-Fiction'})
		})
		.to.throw(": id");
	});

	it("should throw an exception if no Title", function () {
		expect(function () {
			epub = makepub.document({id: "1", author: "A", genre: 'Non-Fiction'})
		})
		.to.throw(": title");
	});

	it("should throw an exception if no Author", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", genre: 'Non-Fiction'})
		})
		.to.throw(": author");
	});

	it("should throw an exception if no Cover", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A", genre: 'Non-Fiction'})
		})
		.to.throw("cover");
	});

	it("should not throw an exception if a Cover is specified", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A", genre: 'Non-Fiction'}, 'cover.png')
		})
		.not.to.throw("cover");
	});

	it("should throw an exception if a missing Cover is specified", function () {
		expect(function () {
			epub = makepub.document({id: "1", title: "T", author: "A", genre: 'Non-Fiction'}, undefined)
		})
		.to.throw("cover");
	});

});

describe("Create EPUB with a valid document", function () {

	var epub;

	beforeEach(function () {
		epub = makepub.document(validMetadata, "test/test-cover.png");
	});

	it("should not throw an exception when addSection is called", function () {
		epub.addSection('title', lipsum);
		expect(true).to.equal(true);
	});

	it("should increase the chapter count when addSection is called", function () {
		epub.addSection('title', lipsum);
		expect(epub.sections.length).to.equal(1);
	});

	it("should return the correct chapter count when getChapterCount is called", function () {
		epub.addSection('title', lipsum);
		expect(epub.getSectionCount()).to.equal(1);
	});

	it("should provide an EPUB file collection when asked", function () {
		epub.addSection('title', lipsum);
		expect(function () {
			epub.getFilesForEPUB()
		}).not.to.throw();
	});

	it("should include an image file asset", function(done) {
		validMetadata.images.push("test/hat.png");
		epub = makepub.document(validMetadata, "test/test-cover.png");
		epub.getFilesForEPUB(function(err, files) {
			var found = false;
			_.each(files, function (f) {
				if (f.name === 'hat.png') {
					found = true;
				}
			});
			expect(found).to.be.true;
			done();
		});
	});

	describe("With a generate contents callback provided", function () {

		var providedContents = false;
		var contentsCallback = function () {
			providedContents = true;
		};

		it("should request contents markup when needed", function () {
			epub = makepub.document(validMetadata, "test/test-cover.png", contentsCallback);
			epub.addSection('Dummy Section.', lipsum);
			epub.getFilesForEPUB();
			expect(providedContents).to.equal(true);
		});

	});

	describe("With added content", function () {

		var files = [];

		beforeEach(function (done) {
			epub = makepub.document(validMetadata, "test/test-cover.png");
			epub.addSection('Chapter 1', lipsum);
			epub.addSection('Chapter 2', lipsum);
			epub.addSection('Chapter 3', lipsum);
			epub.getFilesForEPUB(function(err, epubFiles) {
				files = epubFiles;
				done();
			});
		});

		describe("When the constituent files are requested", function () {

			it("should return the correct number of files", function () {
				expect(files.length).to.equal(12);
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
			var stubMkdir, stubWrite;

			beforeEach(function () {
				stubMkdir = sinon.stub(fs, "mkdir", function (path, cb) { cb(null); });
				stubWrite = sinon.stub(fs, "writeFile", function(path, content, cb) { cb(null); });
			});
			afterEach(function () {
				stubWrite.restore();
				stubMkdir.restore();
			});

			it("Should attempt to create subfolders", function (done) {
				epub.writeFilesForEPUB("test/test", function(err) {
					expect(err).to.be.null;
					expect(fs.mkdir.callCount).to.be.greaterThan(0);
					done();
				});
			});

			it("Should attempt to write the correct quantity of files", function (done) {
				epub.writeFilesForEPUB("test/test", function(err) {
					expect(err).to.be.null;
					expect(fs.writeFile.callCount).to.equal(12);
					done();
				});
			});
		});

		describe("When writing the final EPUB is requested", function () {

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

		describe("With a section excluded from the contents", function () {

			beforeEach(function () {
				epub = makepub.document(validMetadata, "test/test-cover.png");
				epub.addSection('Copyright', "<h1>Copyright Page</h1>", true, true);
				epub.addSection('Chapter 1', lipsum);
				epub.addSection('Chapter 2', lipsum);
				epub.addSection('Chapter 3', lipsum);
			});

			it("should return the correct number of files", function () {
				files = epub.getFilesForEPUB(function(err, files) {
					expect(err).to.be.null;
					expect(files.length).to.equal(13);
				});
			});

			it("should not show the section in the NCX contents metadata", function () {
				files = epub.getFilesForEPUB();
				var ncxContent = ">Copyright<";
				_.each(files, function (f) {
					if (f.name === "navigation.ncx") {
						ncxContent = f.content;
					}
				});
				var copyrightPageInNCX = ncxContent.indexOf(">Copyright<") > -1;
				expect(copyrightPageInNCX).to.equal(false);
			});

			it("should not show the section in the HTML contents area", function () {
				files = epub.getFilesForEPUB();
				var tocContent = ">Copyright<";
				_.each(files, function (f) {
					if (f.name === "toc.xhtml") {
						tocContent = f.content;
					}
				});
				var copyrightPageInTOC = tocContent.indexOf("Copyright") > -1;
				expect(copyrightPageInTOC).to.equal(false);
			});

			describe("With the excluded section being front-matter", function () {

				it("should place the section before the HTML contents page", function () {
					files = epub.getFilesForEPUB();
					var opfContent = "";
					_.each(files, function (f) {
						if (f.name === "ebook.opf") {
							opfContent = f.content;
						}
					});
					var copyrightPageInOPF = opfContent.indexOf("<itemref idref='s1' />");
					var contentsPageInOPF = opfContent.indexOf("<itemref idref='toc'/>");
					expect(copyrightPageInOPF).to.be.lessThan(contentsPageInOPF);
				});

			});

		});

	});

});
