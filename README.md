# Nodepub v1.0.2
## Create valid EPUB (v2) ebooks with metadata, contents and cover image.

[By K Cartlidge](http://www.kcartlidge.com).

## Licence

[MIT Licence (very permissive)](http://opensource.org/licenses/MIT).
[See the GitHub licence summary bullet points here](http://choosealicense.com/licenses/mit/).

A copy of the licence is within the package source.

## About Nodepub

*This version introduces stability at the expense of minor breaking changes, consisting almost entirely of renames from chapter to section but with some of the pre-generated pages of earlier versions eliminated. The result is more abstracted but also more flexible, whilst also retaining most of it's simplicity.*

Nodepub is a **Node** module which can be used to create **EPUB (v2)** documents.

The resultant files are designed to pass the [IDPF online validator](http://validator.idpf.org) and Sigil's preflight checks. They also open fine in IBooks, Adobe Digital Editions and Calibre, plus the Kobo H20 ereader (a highly recommended *backlit* and *waterproof* e-ink device).

They also pass *KindleGen* - although Amazon's `.mobi` files do not support the cover page HTML file the KindleGen tool strips it out so there is no need to make special allowance.

Resultant EPUBs can be generated to one of three levels of completeness:

1. *Either* a complete .epub file ready for distribution
2. *Or* a folder containing all the files necessary to build the final EPUB
3. *Or* a Javascript object containing all the filenames and content needed for the final EPUB


The module has no concept of how the original content is obtained; it is passed a metadata object at creation after which content is added sequentially by the caller. There is no automatic pre-processing of content files such as Markdown as the module expects to be given *HTML* to work with and it is trivial for the caller to pre-process in advance by requiring a Markdown module, the Jade rendering engine or similar.

That said, I *am* currently considering adding Markdown rendering for my own needs.

## Current Status

* The generation of EPUBs to all three levels of completeness mentioned above is in place along with an example script to show the usage. The codebase also includes the resulting example EPUB.

* EPUBs generated pass the expectations listed above.

* All *tests* pass.

* *Cover images* are included (must be in PNG format). I recommend 600x800 or a larger alternative of the same aspect ratio.

* Custom *CSS* can be provided.

* **NEW** - There is now an option to provide a callback function for the generation of the HTML contents page. See the *Public Methods* area below for more details.

* Sections can appear as *front matter*, before the contents page.

* Sections can optionally be *excluded* from the *pre-generated* contents page and metadata-based navigation.

*If* you use the raw generated files to write the EPUB yourself, bear in mind that the **mimetype** file MUST be the first file in the archive and also MUST NOT be compressed. In simple terms, an EPUB is a renamed ZIP file where compression is optional apart from the mimetype file which should be added first using the 'store' option.

ALL functions of the module are synchronous EXCEPT if you choose to use the option to create the complete EPUB (*writeEPUB*), which is internally synchronous whilst generating the file contents but for external purposes is asynchronous with a callback due to the nature of the *archiver* dependency used to create the final output.

As the use of this third output option is expected to be mutually exclusive of the other two, this latter one being asynchronous is not currently considered an issue.

## Upcoming

* *OEBPS and similar folders*. Whilst not actually required by the *spec* (other than for the *mimetype*), there is a certain expectation regarding internal folder structure. This should ideally be implemented before the addition of user-provided assets.

* *Inline images and other assets*. You already have a cover image so the base functionality is there, but I will be adding an option to include an image or other asset (for example an embedded font).

## Requirements

It's an NPM module and depends upon a couple of (mainstream) packages. No external dependencies.

## Installation

It's an npm module:

``` sh
npm install --save nodepub
```

The `--save` bit is optional, but will update your dependencies.

## Tests and Example

To run the tests, in the top folder (containing the *package.json* file) run the following and check the inner test subfolder for a resulting final EPUB:

``` javascript
npm test
```

*Important Note about the Tests*

The tests mostly stub *fs* where used. However at one point they do actually write a final EPUB document as this also serves as one *example* of the resulting files.

This means that (a) the test process needs write access to the test folder and (b) an actual file is generated.
Whilst the *process* is tested, the final EPUB is not; I have manually tested it via the [IDPF Validator](http://validator.idpf.org/).
The actual testing of an EPUB file is already sufficiently covered by the *epubcheck* tool which that site uses, and I have not added it as an integration test.

In addition an *example.js* script is provided:

``` javascript
cd example
node example.js
cd ..
```

This generates a more complete example EPUB document than the test, and the code is commented.

## Usage

*You may find it easier just to look at the `example.js` file aforementioned.*

*For viewing generated metadata I recommend opening the EPUB in Sigil and using it's Tools, Metadata option (F8).*

Using **nodepub** is straightforward. The HTML you provide for chapter contents should be the body markup only (typically a sequence of *&lt;p>one paragraph of text&lt;/p>* lines or headers).

The steps are:

* *Require* the module and call *document()* with a metadata object detailing your book plus the path of a cover image:
``` javascript
var epub = makepub.document(metadata, "cover.png");
```

* Optionally add some *CSS* definitions:
``` javascript
epub.addCSS(myCSS);
```

* Repeatedly call *addSection()* with a title and HTML contents, plus options for whether to exclude from the contents list and/or use as front matter:
``` javascript
epub.addSection('Chapter 1', "<h1>One</h1><p>...</p>");
```

* Produce *one* of the following outputs:

	* Call `getFilesForEPUB()` if you want a simple array of file description and contents for storing in a database or further working through. This array will contain all needed files for a valid EPUB, along with their name, subfolder (if any) and a flag as to whether they should be compressed (a value of *false* should **not** be ignored).

	* Call `writeFilesForEPUB()` if you want to create a folder containing the complete files as mentioned above. You can edit these and produce an EPUB; simply zip the files and change the extention. For a valid EPUB the *mimetype* file **must** be added first and *must not* be compressed. Some validators will pass the file anyway; some ereaders will fail to read it.

	* Call `writeEPUB()`. This is the easiest way and also the only one guaranteed to produce valid EPUB output simply because the other two methods allow for changes and compression issues.

## Public Methods

The following assumes the module has been required using the following statement:

```javascript
var makepub = require("nodepub");
```

---

### document ( metadata, coverImage, generateContentsCallback )

This begins a new document with the given metadata (see below) and cover image (a *path* to a *PNG*).

If the *generateContentsCallback* function is provided then when the HTML markup is needed this function will be called. It will be given 2 parameters; an array of link objects and the pre-generated markup in case you want to just amend the default version rather than take full responsibility for it.

*Simple Example:*

```javascript
var epub = makepub.document(metadata, "./cover.png");
```

*Callback Example 1:*

```javascript
var makeContents = function(links, defaultMarkup) {
	return defaultMarkup.toUppercase();
};
var epub = makepub.document(metadata, "./cover.png", makeContents);
```

*Callback Example 2:*

```javascript
var makeContents = function(links, defaultMarkup) {
	var contents = "<h1>Chapters</h1>";
	_.each(links, function (link) {
		if (link.itemType !== "contents") {
			contents += "<a href='" + link.link + "'>" + link.title + "</a><br />";
		}
	});
	return contents;
};
var epub = makepub.document(metadata, "./cover.png", makeContents);
```

The `links` array which is passed to the callback consists of objects with the following properties:

* *title* - the title of the section to be linked to.
* *link* - the relative `href` within the EPUB.
* *itemType* - one of 3 types, those being *front* for front matter, *contents* for the contents page and *main* for the remaining sections.

The callback should return a string of HTML which will be placed between the `body` and `/body` tags on the contents page.

---

### addCSS ( content )

Adds your own custom *CSS* entries for use across *all* pages in the ebook. The default CSS is empty.

*Example:*
``` javascript
epub.addCSS("body { font-size: 14pt; }");
```

---

### addSection ( title, content, excludeFromContents, isFrontMatter )

Adds a section, which is usually something like a front matter page, a copyright page, a chapter or an about the author page.

* *title*, *content* - these parameters are obvious.
* *excludeFromContents* - this option (default `false`) allows you to add content which does not appear either in the auto-generated HTML table of contents or the metadata contents used directly by ereaders/software. This is handy for example when adding a page just after the cover containing the title and author - quite a common page which does not usually warrant it's own contents entry.
* *isFrontMatter* - this option (default `false`) specifies that the section should appear *before* the contents page. This is often used for copyright pages or similar.

*Example:*

``` javascript
epub.addSection('Copyright', myCopyrightText, false, true);
epub.addSection('Chapter 1', "<h1>One</h1><p>...</p>");
```

---

### getSectionCount ( )

Returns the quantity of sections currently added.

*Example:*

``` javascript
var qty = epub.getSectionCount();
```

---

### getFilesForEPUB ( )

Returns an array of objects for the files needed to create an EPUB as defined so far. Writing these files in the sequence given and respecting all the properties provided should give a valid EPUB document.

*Example:*
``` javascript
var files = epub.getFilesForEPUB();
console.log("Files needed:", files.length);
```

Each entry has the following properties:

* *name* - the filename within the EPUB archive.
* *folder* - any folder within the EPUB archive within which the file should be placed.
* *compress* - whether the file should be compressed - for a fully compliant EPUB this *must* be respected as it is a requirement for the *mimetype* (which will also be listed [and must be written] first).
* *content* - the raw content to write.

---

### writeFilesForEPUB ( folder )

Creates the *folder* (if need be) then writes the files/folders in the order returned by *getFilesForEPUB*. This is ideal for debugging purposes or if you intend to manually/programmatically make changes.

Note that if you are creating your own EPUB from this set of files it is your own responsibility to ensure that the *mimetype* file appears first and is *uncompressed* (technically meaning *stored*).

*Example:*

``` javascript
var qty = epub.writeFilesForEPUB("./raw-files");
```

---

### writeEPUB ( onError, folder, filename, onSuccess )

Creates a *version 2 EPUB* document.

* *onError* - an optional callback function (or `null`) which will be given a single parameter representing any exception raised.
* *folder* - the location to write the EPUB.
* *filename* - the name of the resulting EPUB file *without* the extention.
* *onSuccess* - an optional callback function (or `null`) which will be actioned upon document generation completion.

*Example:*

``` javascript
epub.writeEPUB(function (e) {
	console.log("Error:", e);
}, './output', 'example-ebook', function () {
	console.log("EPUB created.")
});
```

## Metadata

The metadata object passed into the `document` method should look like this:

``` javascript
var metadata = {
	id: Date.now(),
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
	description: 'A test book.',
	contents: 'Chapters',
	source: 'http://www.kcartlidge.com'
};
```

The properties are:

* *id* - the book ID, whether that be an *ISBN*, an Amazon product code or just a random string.
* *title* - just the book title; do not append details of any *series* or *sequence*.
* *series* - any series to which the book belongs (e.g. *The Fellowship of the Ring* belongs to the series *The Lord of the Rings*).
* *sequence* - the book number within any series (e.g. *1* in the Lord of the Rings example above).
* *author* - the user-friendly author name (e.g. *K Cartlidge*).
* *fileAs* - how the author should be considered when filing/sorting (e.g. *Cartlidge, K*).
* *genre* - anything you like (e.g. *Science Fiction*).
* *tags* - a comma-delimited list of *keyword-style* tags, which will appear as multiple *subjects* in the EPUB.
* *copyright* - how you want the *copyright* to appear when applied as a *substitution* (see below), *without* the &copy; symbol.
* *publisher* - the name of the publisher (or yourself if none).
* *published* - the publication date (note the year/month/day format).
* *language* - the short *ISO* language name (e.g. *en* for English or *fr* for French).
* *description* - the short description included within the book definition and shown in (for example) the list view in *iBooks*.
* *contents* - the *title* of the auto-generated contents HTML page.
* *source* - the derivation of the document, in this case a URL but it could also be an ISBN or similar if it is a derivative work.

## Substitutions

As mentioned briefly under the *copyright* entry of the *metadata* section above, a form of text substitution is supported.

Basically, at any point in your section *content* you may include placeholders like `[[COPYRIGHT]]`. When the EPUB is generated any such placeholders which (within the double square braces) match the *capitalised* name of a *metadata* entry are replaced with the corresponding metadata value.

For example, you could have a *Thanks for Reading* page at the end of your book which has the following markup:

``` html
<p>Thanks for reading <strong>[[TITLE]]</strong> by <em>[[AUTHOR]]</em>.</p>
```

When the EPUB is produced and opened it will then look like:

----

Thanks for reading **The Hobbit** by *JRR Tolkien*.

----

This means you can re-use snippets of content across multiple books or refer to the author/title/series/whatever at any point within the book without worrying about consistency of spelling, naming conventions etcetera.

## Reminder

*This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic ommission checks are performed*
