# Nodepub v2.1.0

Create valid EPUB (v2) ebooks with metadata, contents and cover image.

## About Nodepub

Nodepub is a **Node** module which can be used to create **EPUB (v2)** documents.

* Files pass the [IDPF online validator](http://validator.idpf.org)
* Files meet Sigil's preflight checks
* Files open fine in iBooks, Adobe Digital Editions and Calibre
* Files open fine with the Kobo H20 ereader
* Files are fine as *KindleGen* input
* PNG cover images - recommend 600x800, 600x900, or similar as minimum
* Custom CSS can be provided
* Inline images within the EPUB
* Optionally generate your own contents page
* Front matter before the contents page
* Exclude sections from auto contents page and metadata-based navigation
* OEBPS and other 'expected' subfolders within the EPUB

## Installing Nodepub

Add it as with any other module:

``` sh
npm i nodepub
```

Import it for use:

``` javascript
var nodepub = require("nodepub");
```

## Using Nodepub

### Creating your content

Your document will consist of *metadata* and *sections*.
Metadata is an object with various properties detailing the book.
Sections are chunks of HTML that can be thought of as chapters.

Here's some sample metadata:

``` javascript
var metadata = {
  id: '278-123456789',
  title: 'Unnamed Document',
  series: 'My Series',
  sequence: 1,
  author: 'KA Cartlidge',
  fileAs: 'Cartlidge,KA',
  genre: 'Non-Fiction',
  tags: 'Sample,Example,Test',
  copyright: 'Anonymous, 1980',
  publisher: 'My Fake Publisher',
  published: '2000-12-31',
  language: 'en',
  description: 'A test book.',
  contents: 'Table of Contents',
  source: 'http://www.kcartlidge.com',
  images: ["../test/hat.png"]
};
```

* The `series` and `sequence` are not recognised by many readers (the *Calibre* properties are used).
* The `tags` become subjects in the final EPUB.
* For `published` note the year-month-day format.
* The `language` is the short *ISO* language name (`en`, `fr`, `de` etc).
* The `images` array is where you refer to all images used inside the book. Within your section HTML you always link to one all-containing flat folder: `<img src="../images/hat.png" />`.

### Populating EPUBs

Call `document` with a metadata object detailing your book plus the path of a cover image.

``` javascript
var epub = makepub.document(metadata, "./cover.png");
```

#### Choose to make your own contents page

```javascript
var makeContentsPage = function(links) {
  var contents = "<h1>Chapters</h1>";
  _.each(links, function (link) {
    if (link.itemType !== "contents") {
      contents += "<a href='" + link.link + "'>" + link.title + "</a><br />";
    }
  });
  return contents;
};
var epub = makepub.document(metadata, "./cover.png", makeContentsPage);
```

The `links` array which is passed to a callback consists of objects with the following properties:

* *title* - the title of the section to be linked to.
* *link* - the relative `href` within the EPUB.
* *itemType* - one of 3 types, those being *front* for front matter, *contents* for the contents page and *main* for the remaining sections.

The callback should return a string of HTML which will form the body of the contents page.

#### Optionally add some CSS

``` javascript
epub.addCSS(`p { text-indent: 0; } p+p { text-indent: 0.75em; }`);
```

#### Fill in the actual content

Call `addSection` with a title and HTML contents for each section (usually a chapter) plus options for whether to exclude it from the contents page list and/or to use it as front matter.

``` javascript
epub.addSection('Copyright', copyright, false, true);
epub.addSection('Chapter 1', "<h1>One</h1><p>...</p>");
```

Excluding from the contents page list allows you to add content which does not appear either in the auto-generated HTML table of contents or the metadata contents used directly by ereaders/software. This is handy for example when adding a page just after the cover containing the title and author - a common page which does not usually appear in the book contents.

### Creating a complete EPUB file ready for distribution

This is the simplest option.

``` javascript
epub.writeEPUB(
  function (e) { console.log("Error:", e); },
  '/folder', 'filename-without-extention',
  function () { console.log("No errors.") }
);
```

### Creating a folder containing all the files necessary to build the final EPUB yourself

If you need to do further work on your EPUB, this option writes the entire constituent files into a folder. When you write your EPUB out, it should consist of this folder's contents zipped up and renamed, with the sole proviso that the first file in the zip should be the `mimetype` file stored uncompressed.

``` javascript
epub.writeFilesForEPUB(
  '/folder-for-EPUB-files',
  (err) => { if (err) { console.log(err); } }
);
```

### Creating a Javascript object containing all the filenames and content needed for the final EPUB

Finally in a similar manner to the previous folder of files you can have the same set of content returned to you directly for you to do what you want with.

``` javascript
epub.getFilesForEPUB(
  function (err, epubFiles) {
    console.log("Files array:", epubFiles);
  }
);
```

---

## Substitutions

A simple form of text substitution is supported. At any point in your section's content you may include placeholders like `[[COPYRIGHT]]`. When the EPUB is generated any such placeholders which match the *capitalised* name of a *metadata* entry are replaced with the corresponding metadata value.

For example, you could have a "Thanks for Reading" page at the end of your book which has the following markup:

``` html
<p>Thanks for reading <strong>[[TITLE]]</strong> by <em>[[AUTHOR]]</em>.</p>
```

When the EPUB is produced and opened, if your metadata was set as per the book "The Hobbit" by "JRR Tolkien" it will look like:

---

Thanks for reading **The Hobbit** by *JRR Tolkien*.

---

This means you can re-use content across multiple books or refer to the author/title/series/whatever at any point within the book without worrying about consistency or maintenance.

## An example

In the top folder (containing the *package.json* file) run the following.

``` javascript
npm run example
```

This will generate various outputs and advise you of the location.

---

---

## For nodepub developers only

### Tests and example

In the top folder (containing the *package.json* file) run one of the following.

``` javascript
npm test
npm run example
```

### Code quality

In addition to the tests I use **ES Lint** and **Editor Config**. Make sure your editor/ide has support for the `.editorconfig` file, and when changing code do the following afterwards.

``` javascript
npm run lint
```

This will auto-fix what it can. You will have less issues if your editor/IDE also has an ES Lint integration.

*Visual Studio Code* has both of the above via plugins.

### Notes

* The tests mostly stub *fs* where used. However at one point they do actually write a final EPUB document. This means that (a) the test process needs write access to the test folder and (b) an actual file is generated.

* Whilst the *process* of generating EPUBs is tested, the *final EPUB* is not; I have manually tested it via the [IDPF Validator](http://validator.idpf.org/). The actual testing of an EPUB file is already sufficiently covered by the *epubcheck* tool which that site uses, and I have not added it as an integration test.

* You may find it helpful to look at the `example/example.js` file.

* For viewing generated metadata and content both Microsoft Edge and Calibre have good EPUB readers.

## Reminder

This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic ommission checks are performed.
