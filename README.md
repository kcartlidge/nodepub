# Nodepub v1.0.0
## Create valid EPUB (v2) ebooks with metadata, contents and cover image.

[By K Cartlidge](http://www.kcartlidge.com).

## Licence

[MIT Licence (very permissive)](http://opensource.org/licenses/MIT).
[See the GitHub licence summary bullet points here](http://choosealicense.com/licenses/mit/).

A copy of the licence is within the package source.

## About Nodepub

*This version introduces stability at the expense of minor breaking changes, consisting almost entirely of renames from *chapter* to *section* but with some of the pre-generated pages of earlier versions eliminated.*

Nodepub is a **Node** module which can be used to create **EPUB (v2)** documents.

The resultant files are designed to pass the [IDPF online validator](http://validator.idpf.org) and Sigil's preflight checks. They also open fine in IBooks, Adobe Digital Editions and Calibre.

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

* *Cover images* are included (must be in PNG format). I recommend 600x800 or an alternative of the same aspect ratio.

* Custom *CSS* can be provided.

* Sections can appear as *front matter*, before the contents page.

* Sections can optionally be *excluded* from the contents page and metadata-based navigation.

*If* you use the raw generated files to write the EPUB yourself, bear in mind that the **mimetype** file MUST be the first file in the archive and also MUST NOT be compressed. In simple terms, an EPUB is a renamed ZIP file where compression is optional apart from the mimetype file which should be added first using the 'store' option.

ALL functions of the module are synchronous EXCEPT if you choose to use the option to create the complete EPUB (*writeEPUB*), which is internally synchronous whilst generating the file contents but for external purposes is asynchronous with a callback due to the nature of the *archiver* dependency used to create the final output.

As the use of this third output option is expected to be mutually exclusive of the other two, this latter one being asynchronous is not currently considered an issue.

## Upcoming

* *Inline images*. You can already have a cover image so the base functionality is there, but I will be adding an option to insert an image at any point in the text.

* *Custom contents page*. It is expected that the caller will be able to provide a contents page callback handler to optionally override the built-in one. It will be provided with a list of the contents and expected to return HTML markup.

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

	Call *getFilesForEPUB()* if you want a simple array of file description and contents for storing in a database or further working through. This array will contain all needed files for a valid EPUB, along with their name, subfolder (if any) and a flag as to whether they should be compressed (a value of *false* should **not** be ignored).
```javascript
var files = epub.getFilesForEPUB();
```

	Call *writeFilesForEPUB()* if you want to create a folder containing the complete files as mentioned above. You can edit these and produce an EPUB; simply zip the files and change the extention. For a valid EPUB the *mimetype* file **must** be added first and *must not* be compressed. Some validators will pass the file anyway; some ereaders will fail to read it.
```javascript
epub.writeFilesForEPUB("./output");
```

	Call *writeEPUB()*. This is the easiest way and also the only one guaranteed to produce valid EPUB output simply because the other two methods allow for changes and compression issues.
```javascript
epub.writeEPUB(function (e) {
		console.log("Error:", e);
}, './output', 'example-ebook', function () {
		console.log("EPUB created.")
});
```

## Public Methods

The following assumes the module has been required using the following statement:

```javascript
var makepub = require("nodepub");
```

### document ( metadata, coverImage )

This begins a new document with the given metadata (see below) and cover image (a *path* to a *PNG*).

*Example:*
```javascript
var epub = makepub.document(metadata, "./cover.png");
```

### addCSS ( content )

Adds your own custom *CSS* entries for use across *all* pages in the ebook. The default CSS is empty.

*Example:*
``` javascript
epub.addCSS("body { font-size: 14pt; }");
```

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

### getSectionCount ( )

Returns the quantity of sections currently added.

*Example:*
``` javascript
var qty = epub.getSectionCount();
```

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

### writeFilesForEPUB ( folder )

Creates the *folder* (if need be) then writes the files/folders in the order returned by *getFilesForEPUB*. This is ideal for debugging purposes or if you intend to manually/programmatically make changes.

Note that if you are creating your own EPUB from this set of files it is your own responsibility to ensure that the *mimetype* file appears first and is *uncompressed* (technically meaning *stored*).

*Example:*
``` javascript
var qty = epub.writeFilesForEPUB("./raw-files");
```

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


## Reminder

*This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic ommission checks are performed*
