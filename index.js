
var sampleMetadata = {
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

/*
	Sample cover by Hyokano (https://www.flickr.com/photos/75797208@N00/2847467731/).
	Licensed as CC BY-SA 2.0 (https://creativecommons.org/licenses/by-sa/2.0/).
	Included under that licence with no endorsement implied on behalf of the creator.
*/

var fs = require('fs'), zip = require('archiver'), _ = require('underscore');

exports.document = document;

// Main entry point.
function document(metadata) {
	var self = this;

  // Basic validation.
  var required = ["ID", "Title", "Author", "Cover"];
  if (metadata == null) throw "Missing metadata";
  _.each(required, function(field) {
    var lowerField = field.toLowerCase();
    var prop = metadata[lowerField];
    if (prop == null || typeof(prop) == "undefined" || prop.toString().trim() == "")
      throw "Missing metadata: " + field;
  });
  try {
    fs.statSync(metadata.cover).isFile();
  } catch (e) {
    throw "Missing or invalid metadata: Cover"
  }

	// Add a new chapter with the given title and (HTML) body content.
	self.addChapter = function(title,content) {
		self.chapters.push({title:title, content:content});
	};

	// Gets the number of chapters added so far.
	self.getChapterCount = function() {
		return self.chapters.length;
	};

	// Gets the files needed for the EPUB, as an array of objects.
	// Note that 'compress:false' MUST be respected for valid EPUB files.
	self.getFilesForEPUB = function() {
		var files = [];
		files.push({ name:'mimetype', folder:'', compress:false, content:getMimetype() });
		files.push({ name:'container.xml', folder:'META-INF', compress:true, content:getContainer(self) });
		files.push({ name:'ebook.opf', folder:'', compress:true, content:getOPF(self) });
		files.push({ name:'navigation.ncx', folder:'', compress:true, content:getNCX(self) });
		files.push({ name:'toc.xhtml', folder:'', compress:true, content:getTOC(self) });
		files.push({ name:'cover.xhtml', folder:'', compress:true, content:getCover(self) });
		if (self.metadata.includeCopyrightPage) {
			files.push({ name:'copyright.xhtml', folder:'', compress:true, content:getCopyright(self) });
		}
		files.push({ name:'ebook.css', folder:'', compress:true, content:getCSS(self) });
		files.push({ name:'Cover.png', folder:'', compress:true, content:fs.readFileSync(self.metadata.cover) });
		for(var i = 1; i <= self.chapters.length; i++) {
			files.push({ name:'ch' + i + '.xhtml', folder:'', compress:true, content:getChapter(self, i) });
		};
		files.push({ name:'back.xhtml', folder:'', compress:true, content:getBackMatter(self) });
		return files;
	};

	// Writes the files needed for the EPUB into a folder structure.
	// Note that for valid EPUB files the 'mimetype' MUST be the first entry in an EPUB and uncompressed.
	self.writeFilesForEPUB = function(folder) {
		var files = self.getFilesForEPUB();
		makeFolder(folder);
		for(var i in files) {
			if (files[i].folder.length > 0) {
				makeFolder(folder + '/' + files[i].folder);
				fs.writeFileSync(folder + '/' + files[i].folder + '/' + files[i].name, files[i].content);
			} else {
				fs.writeFileSync(folder + '/' + files[i].name, files[i].content);
			};
		};
	};

	// Writes the EPUB. The filename should not have an extention.
	self.writeEPUB = function(onError, folder, filename, onSuccess) {
		try {
			var files = self.getFilesForEPUB();
			makeFolder(folder);

			// Start a zip stream emitter.
			var output = fs.createWriteStream(folder + '/' + filename + '.epub');
			var archive = zip('zip', { store: false });

			// Some end-state handlers.
			output.on('close', function () {
			  if (typeof(onSuccess) == 'function') {
				  onSuccess(null);
				};
			});
			archive.on('error', function(err) {
				throw err;
			});
			archive.pipe(output);

			// Write the file contents.
			for(var i in files) {
				if (files[i].folder.length > 0) {
					archive.append(null, { name:files[i].folder + '/' });
					archive.append(files[i].content, { name:files[i].folder + '/' + files[i].name, store: !files[i].compress });
				} else {
					archive.append(files[i].content, { name:files[i].name, store: !files[i].compress });
				};
			};

			// Done.
			archive.finalize();
		} catch (err) {
			  if (typeof(onError) == 'function') {
			    onError(err);
				};
		};
	};

	self.metadata = metadata ? metadata : sampleMetadata;
	self.chapters = [];
	return self;
};

// Replace a single tag.
function tagReplace(original, tag, value) {
	var fullTag = "[[" + tag + "]]";
	return original.split(fullTag).join(value);
};

// Private. Do any in-line replacements needed.
function replacements(document, original) {
	var result = original;
	result = tagReplace(result, 'EOL', '\n');
	result = tagReplace(result, 'ID', document.metadata.id);
	result = tagReplace(result, 'TITLE', document.metadata.title);
	result = tagReplace(result, 'SERIES', document.metadata.series);
	result = tagReplace(result, 'SEQUENCE', document.metadata.sequence);
	result = tagReplace(result, 'COPYRIGHT', document.metadata.copyright);
	result = tagReplace(result, 'LANGUAGE', document.metadata.language);
	result = tagReplace(result, 'FILEAS', document.metadata.fileAs);
	result = tagReplace(result, 'AUTHOR', document.metadata.author);
	result = tagReplace(result, 'PUBLISHER', document.metadata.publisher);
	result = tagReplace(result, 'DESCRIPTION', document.metadata.description);
	result = tagReplace(result, 'PUBLISHED', document.metadata.published);
	result = tagReplace(result, 'GENRE', document.metadata.genre);
	result = tagReplace(result, 'TAGS', document.metadata.tags);
	result = tagReplace(result, 'THANKS', document.metadata.thanks);
	result = tagReplace(result, 'BOOKPAGE', document.metadata.bookPage);
	result = tagReplace(result, 'LINKTEXT', document.metadata.linkText);
	return result;
};

// Private. Provide the contents of the mimetype file (which should not be compressed).
function getMimetype() {
	return 'application/epub+zip';
};

// Private. Provide the contents of the container XML file.
function getContainer(document) {
	var result = "";
	result += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]"
	result += "<container version='1.0' xmlns='urn:oasis:names:tc:opendocument:xmlns:container'>[[EOL]]"
	result += "  <rootfiles>[[EOL]]"
	result += "    <rootfile full-path='ebook.opf' media-type='application/oebps-package+xml'/>[[EOL]]"
	result += "  </rootfiles>[[EOL]]"
	result += "</container>";
	return replacements(document, replacements(document, result));
};

// Private. Provide the contents of the OPL (spine) file.
function getOPF(document) {
	var opf = '';
	opf += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]";
	opf += "<package xmlns='http://www.idpf.org/2007/opf' version='2.0' unique-identifier='BookId'>[[EOL]]";
	opf += "	<metadata xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:opf='http://www.idpf.org/2007/opf'>[[EOL]]";
	opf += "		<dc:title>[[TITLE]]</dc:title>[[EOL]]";
	opf += "		<dc:identifier id='BookId' opf:scheme='URI'>[[ID]]</dc:identifier>[[EOL]]";
	opf += "		<dc:language>[[LANGUAGE]]</dc:language>[[EOL]]";
	opf += "		<dc:creator opf:role='aut' opf:file-as='[[FILEAS]]'>[[AUTHOR]]</dc:creator>[[EOL]]";
	opf += "		<dc:publisher>[[PUBLISHER]]</dc:publisher>[[EOL]]";
	opf += "		<dc:description>[[DESCRIPTION]]</dc:description>[[EOL]]";
	opf += "		<dc:coverage></dc:coverage>[[EOL]]";
	opf += "		<dc:source></dc:source>[[EOL]]";
	opf += "		<dc:date opf:event='publication'>[[PUBLISHED]]</dc:date>[[EOL]]";
	opf += "		<dc:rights>[[COPYRIGHT]]</dc:rights>[[EOL]]";
	opf += "		<dc:subject>[[GENRE]]</dc:subject>[[EOL]]";

	if (document.metadata.tags) {
	  var tags = document.metadata.tags.split(',');
	  for(var i = 0; i < tags.length; i++) {
			opf += "		<dc:subject>" + tags[i] + "</dc:subject>[[EOL]]";
		}
	}

	if (document.metadata.series && document.metadata.sequence) {
		opf += "		<meta name='calibre:series' content='[[SERIES]]'/>[[EOL]]"
		opf += "		<meta name='calibre:series_index' content='[[SEQUENCE]]'/>[[EOL]]"
	}

	opf += "		<meta name='cover' content='cover-image'/>[[EOL]]";
	opf += "	</metadata>[[EOL]]";
	opf += "	<manifest>[[EOL]]";
	opf += "		<item id='cover-image' media-type='image/png' href='Cover.png'/>[[EOL]]";
	opf += "		<item id='cover' media-type='application/xhtml+xml' href='cover.xhtml'/>[[EOL]]";
	opf += "		<item id='navigation' media-type='application/x-dtbncx+xml' href='navigation.ncx'/>[[EOL]]";

	for(var i = 1; i <= document.chapters.length; i++) {
		opf += "		<item id='ch"+i+"' media-type='application/xhtml+xml' href='ch"+i+".xhtml'/>[[EOL]]";
	}

	if (document.metadata.includeCopyrightPage) {
		opf += "		<item id='copyright' media-type='application/xhtml+xml' href='copyright.xhtml'/>[[EOL]]";
	}

	opf += "		<item id='toc' media-type='application/xhtml+xml' href='toc.xhtml'/>[[EOL]]";
	opf += "		<item id='css' media-type='text/css' href='ebook.css'/>[[EOL]]";
	opf += "		<item id='back' media-type='application/xhtml+xml' href='back.xhtml'/>[[EOL]]";
	opf += "	</manifest>[[EOL]]";
	opf += "	<spine toc='navigation'>[[EOL]]";
	opf += "		<itemref idref='cover' linear='yes' />[[EOL]]";
	opf += "		<itemref idref='copyright'/>[[EOL]]";
	opf += "		<itemref idref='toc'/>[[EOL]]";

	for(var i=1; i <= document.chapters.length; i++) {
		opf += "		<itemref idref='ch"+i+"' />[[EOL]]";
	}

	opf += "		<itemref idref='back'/>[[EOL]]";
	opf += "	</spine>[[EOL]]";
	opf += "	<guide>[[EOL]]";
	opf += "		<reference type='toc' title='Contents' href='toc.xhtml'></reference>[[EOL]]";
	opf += "	</guide>[[EOL]]";
	opf += "</package>[[EOL]]";
	return replacements(document, replacements(document, opf));
};

// Private. Provide the contents of the NCX file.
function getNCX(document) {
	var ncx = '';
	var playOrder = 1;
	ncx +=  "<?xml version='1.0' encoding='UTF-8'?>[[EOL]]";
	ncx +=  "<!DOCTYPE ncx PUBLIC '-//NISO//DTD ncx 2005-1//EN' 'http://www.daisy.org/z3986/2005/ncx-2005-1.dtd'>[[EOL]]";
	ncx +=  "<ncx xmlns='http://www.daisy.org/z3986/2005/ncx/'>[[EOL]]";
	ncx +=  "<head>[[EOL]]";
	ncx +=  "  <meta name='dtb:uid' content='[[ID]]'/>[[EOL]]";
	ncx +=  "  <meta name='dtb:depth' content='1'/>[[EOL]]";
	ncx +=  "  <meta name='dtb:totalPageCount' content='0'/>[[EOL]]";
	ncx +=  "  <meta name='dtb:maxPageNumber' content='0'/>[[EOL]]";
	ncx +=  "</head>[[EOL]]";
	ncx +=  "<docTitle><text>[[TITLE]]</text></docTitle>[[EOL]]";
	ncx +=  "<docAuthor><text>[[AUTHOR]]</text></docAuthor>[[EOL]]";
	ncx +=  "<navMap>[[EOL]]";
	ncx +=  "  <navPoint id='cover' playOrder='" + (playOrder++) + "'>[[EOL]]";
	ncx +=  "    <navLabel><text>Cover</text></navLabel>[[EOL]]";
	ncx +=  "    <content src='cover.xhtml'/>[[EOL]]";
	ncx +=  "  </navPoint>[[EOL]]";

	if (document.metadata.includeCopyrightPage) {
		ncx +=  "  <navPoint id='copyright' playOrder='" + (playOrder++) + "'>[[EOL]]";
		ncx +=  "    <navLabel><text>Copyright</text></navLabel>[[EOL]]";
		ncx +=  "    <content src='copyright.xhtml'/>[[EOL]]";
		ncx +=  "  </navPoint>[[EOL]]";
	}

	ncx +=  "  <navPoint class='toc' id='toc' playOrder='" + (playOrder++) + "'>[[EOL]]";
	ncx +=  "    <navLabel><text>Contents</text></navLabel>[[EOL]]";
	ncx +=  "    <content src='toc.xhtml'/>[[EOL]]";
	ncx +=  "  </navPoint>[[EOL]]";
	ncx +=  "  <navPoint id='start' playOrder='" + (playOrder++) + "'>[[EOL]]";
	ncx +=  "    <navLabel><text>Start Reading</text></navLabel>[[EOL]]";
	ncx +=  "    <content src='ch1.xhtml#start_reading'/>[[EOL]]";
	ncx +=  "  </navPoint>[[EOL]]";

	for(var i=1; i <= document.chapters.length; i++) {
		var title = document.chapters[i-1].title;
		var order = i + playOrder - 1;
		ncx +=  "  <navPoint class='chapter' id='ch"+i+"' playOrder='" + order + "'>[[EOL]]";
		ncx +=  "    <navLabel><text>" + title + "</text></navLabel>[[EOL]]";
		ncx +=  "    <content src='ch" + i + ".xhtml'/>[[EOL]]";
		ncx +=  "  </navPoint>[[EOL]]";
	}

	ncx +=  "</navMap>[[EOL]]";
	ncx +=  "</ncx>[[EOL]]";
	return replacements(document, replacements(document, ncx));
};

// Private. Provide the contents of the TOC file.
function getTOC(document) {
	var toc = '';
	toc += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]";
	toc += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd' >[[EOL]]";
	toc += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]";
	toc += "  <head>[[EOL]]";
	toc += "    <title>Contents</title>[[EOL]]";
	toc += "    <link rel='stylesheet' type='text/css' href='ebook.css' />[[EOL]]";
	toc += "  </head>[[EOL]]";
	toc += "  <body>[[EOL]]";
	toc += "    <div class='contents'>[[EOL]]";
	toc += "        <div id='toc'></div>[[EOL]]";
	toc += "        <h1>Contents</h1>[[EOL]]";
	toc += "        <div class='toc'>[[EOL]]";

	for(var i=1; i <= document.chapters.length; i++) {
		var title = document.chapters[i-1].title;
		toc += "          <a href='ch" + i + ".xhtml'>" + title + "</a><br/>[[EOL]]";
	}

	toc += "        </div>[[EOL]]";
	toc += "    </div>[[EOL]]";
	toc += "  </body>[[EOL]]";
	toc += "</html>[[EOL]]";
	return replacements(document, replacements(document, toc));
};

// Private. Provide the contents of the cover HTML enclosure.
function getCover(document) {
	var cover = '';
	cover += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]";
	cover += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'  'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
	cover += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>[[EOL]]";
	cover += "<head>[[EOL]]";
	cover += "  <title>[[TITLE]]</title>[[EOL]]";
	cover += "  <style type='text/css'>[[EOL]]";
	cover += "    .cover { margin: 0; padding: 0; font-size: 1px; }[[EOL]]";
	cover += "  </style>[[EOL]]";
	cover += "</head>[[EOL]]";
	cover += "<body style='margin: 0; text-align: center; background-color: #ffffff;'>[[EOL]]";
	cover += "  <p class='cover'><img style='height: 100%;' src='Cover.png' alt='Cover' /></p>[[EOL]]";
	cover += "</body>[[EOL]]";
	cover += "</html>[[EOL]]";
	return replacements(document, replacements(document, cover));
};

// Private. Provide the contents of the copyright page.
function getCopyright(document) {
	var copyright = '';
	copyright += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]";
	copyright += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'  'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
	copyright += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>[[EOL]]";
	copyright += "<head>[[EOL]]";
	copyright += "  <title>[[TITLE]]</title>[[EOL]]";
	copyright += "  <link rel='stylesheet' type='text/css' href='ebook.css' />[[EOL]]";
	copyright += "</head>[[EOL]]";
	copyright += "<body>[[EOL]]";
	copyright += "  <div class='titles'>[[EOL]]";
	copyright += "    <p class='skipdownb'> &nbsp;</p>[[EOL]]";
	copyright += "    <h1>[[TITLE]]</h1>[[EOL]]";

	if (document.metadata.series && document.metadata.sequence) {
		copyright += "    <h2>Book [[SEQUENCE]] of [[SERIES]]</h2>[[EOL]]";
	}

	copyright += "    <p class='skipdowns'> &nbsp;</p>[[EOL]]";

	if (document.metadata.copyright) {
		copyright += "    <h2>&copy; [[COPYRIGHT]]</h2>[[EOL]]";
	} else {
		copyright += "    <h2>&copy; [[AUTHOR]]</h2>[[EOL]]";
	}

  var year = parseInt(document.metadata.published);
	copyright += "    <h3>Published by [[PUBLISHER]], " + year + ".</h3>[[EOL]]";
	copyright += "  </div>[[EOL]]";
	copyright += "</body>[[EOL]]";
	copyright += "</html>[[EOL]]";
	return replacements(document, replacements(document, copyright));
};

// Private. Provide the contents of the copyright page.
function getBackMatter(document) {
	var back = '';
	back += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]";
	back += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'  'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
	back += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>[[EOL]]";
	back += "<head>[[EOL]]";
	back += "  <title>[[TITLE]]</title>[[EOL]]";
	back += "  <link rel='stylesheet' type='text/css' href='ebook.css' />[[EOL]]";
	back += "</head>[[EOL]]";
	back += "<body>[[EOL]]";
	back += "  <div class='titles'>[[EOL]]";
	back += "    <p class='skipdownb'> &nbsp;</p>[[EOL]]";
	back += "    <h1>[[TITLE]]</h1>[[EOL]]";

	if (document.metadata.series && document.metadata.sequence) {
		back += "    <h2>Book [[SEQUENCE]] of [[SERIES]]</h2>[[EOL]]";
	}

	back += "    <p class='skipdowns'> &nbsp;</p>[[EOL]]";

	if (document.metadata.thanks) {
		back += "    <p>[[THANKS]]</p>[[EOL]]";
	}

	if (document.metadata.linkText && document.metadata.bookPage) {
		back += "    <p><a href='[[BOOKPAGE]]'>[[LINKTEXT]]</a></p>[[EOL]]"
	}

	back += "  </div>[[EOL]]";
	back += "</body>[[EOL]]";
	back += "</html>[[EOL]]";
	return replacements(document, replacements(document, back));
};

// Private. Provide the contents of the CSS file.
function getCSS(document) {
	var css = '';
	css += " body                           { font-family: 'Open Sans', 'Mono Sans', 'Roboto Sans', Verdana, 'Sans-Serif'; font-size: 14pt; padding: 0px; margin: 10px; color: #000000; }[[EOL]]";
	css += " h1, h2, h3                     { font-size: 12pt; line-height: 1.25em; font-weight: normal; font-style: normal; }[[EOL]]";
	css += " a, a:link, a:active, a:visited { text-decoration: underline; }[[EOL]]";
	css += " img                            { border: none; }[[EOL]]";
	css += " p                              { margin-top: 20px; text-indent: 0.5em; text-align: left; font-size: 14pt; line-height: 1.5em; }[[EOL]]";
	css += " ul                             { margin-left: 2em; }[[EOL]]";
	css += " li                             { display: block; }[[EOL]]";
	css += " h1, h2, h3                     { color: #000033; font-weight: bold; }[[EOL]]";
	css += " h1                             { font-size: 20pt; margin-bottom: 32px; }[[EOL]]";
	css += " h1.chapter                     { margin-top: 5em; }[[EOL]]";
	css += " h1 .big                        { font-size: 3em; display: block; padding-bottom: 0.3em; color: #cccccc; }[[EOL]]";
	css += " h2                             { font-size: 12pt; }[[EOL]]";
	css += " h3                             { font-size: 10pt; }[[EOL]]";
	css += ".titles, .titles p              { padding: 0; text-align: center; }[[EOL]]";
	css += ".toc                            { padding-top: 12px; padding-left: 0; }[[EOL]]";
	css += ".toc a                          { line-height: 1.5em; text-decoration: none; }[[EOL]]";
	css += ".skipdownb                      { padding-top: 60px; }[[EOL]]";
	css += ".skipdowns                      { padding-top: 40px; }[[EOL]]";
	css += ".centred                        { text-align: center; }[[EOL]]";
	css += ".scene                          { text-align: center; padding: 10px 0 10px 0; }[[EOL]]";
	return replacements(document, replacements(document, css));
};

// Private. Provide the contents of a single chapter's HTML.
function getChapter(document, chapterNumber) {
	var chapter = document.chapters[chapterNumber - 1];
	var title = chapter.title;
	var content = chapter.content;
	var showChapterNumbers = document.metadata.showChapterNumbers

	html = '';
	html += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]";
	html += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
	html += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]";
	html += "  <head profile='http://dublincore.org/documents/dcmi-terms/'>[[EOL]]";
	html += "    <meta http-equiv='Content-Type' content='text/html;' />[[EOL]]";
	html += "    <title>[[TITLE]] - " + title + "</title>[[EOL]]";
	html += "    <meta name='DCTERMS.title' content='[[TITLE]]' />[[EOL]]";
	html += "    <meta name='DCTERMS.language' content='[[LANGUAGE]]' scheme='DCTERMS.RFC4646' />[[EOL]]";
	html += "    <meta name='DCTERMS.source' content='MFW' />[[EOL]]";
	html += "    <meta name='DCTERMS.issued' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]";
	html += "    <meta name='DCTERMS.creator' content='[[AUTHOR]]'/>[[EOL]]";
	html += "    <meta name='DCTERMS.contributor' content='' />[[EOL]]";
	html += "    <meta name='DCTERMS.modified' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]";
	html += "    <meta name='DCTERMS.provenance' content='' />[[EOL]]";
	html += "    <meta name='DCTERMS.subject' content='[[GENRE]]' />[[EOL]]";
	html += "    <link rel='schema.DC' href='http://purl.org/dc/elements/1.1/' hreflang='en' />[[EOL]]";
	html += "    <link rel='schema.DCTERMS' href='http://purl.org/dc/terms/' hreflang='en' />[[EOL]]";
	html += "    <link rel='schema.DCTYPE' href='http://purl.org/dc/dcmitype/' hreflang='en' />[[EOL]]";
	html += "    <link rel='schema.DCAM' href='http://purl.org/dc/dcam/' hreflang='en' />[[EOL]]";
	html += "    <link rel='stylesheet' type='text/css' href='ebook.css' />[[EOL]]";
	html += "    <base href='.' />[[EOL]]";
	html += "  </head>[[EOL]]";
	html += "  <body>[[EOL]]";
	html += "    <div id='start_reading'></div>[[EOL]]";
	html += "    <div id='ch" + chapterNumber + "'></div>[[EOL]]";

  if (showChapterNumbers) {
    html += "    <h1 class='big-chapter'><span class='big'>" + chapterNumber + "</span>" + title + "</h1>[[EOL]]";
  } else {
    html += "    <h1 class='chapter'>" + title + "</h1>[[EOL]]";
  }

	var lines = content.split('\n');
	var emptyRun = 0;
	for(var lineIdx in lines) {
		var line = lines[lineIdx];
		if (line.length > 0) {
			html += "    " + line + "[[EOL]]";
		}
	}

	html += "  </body>[[EOL]]";
	html += "</html>[[EOL]]";
	return replacements(document, replacements(document, html));
};

// Create a folder, throwing an error only if that error is not that
// the folder already exists. Effectively creates if not found.
function makeFolder(path) {
	try {
		fs.mkdirSync(path);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}
};

