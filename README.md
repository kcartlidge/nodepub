![Mocha](https://img.shields.io/badge/mocha-passing-success)
![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-success.svg)
![IDPF](https://img.shields.io/badge/idpf-valid-success)

# Nodepub v3.0.7

Create valid EPUB 2 ebooks with metadata, contents, and cover image.

## About Nodepub

Nodepub is a **Node** module which can be used to create **EPUB 2** documents.

* Files pass the [IDPF online validator](http://validator.idpf.org)
* Files meet Sigil's preflight checks
* Files open fine in iBooks, Adobe Digital Editions, and Calibre
* Files open fine with the Kobo H20 ereader
* Files are fine as *KindleGen* input
* PNG/JPG cover images - recommend 600x800, 600x900, or similar as minimum
* Custom CSS can be provided
* Inline images within the EPUB
* Optionally generate your own contents page
* Front matter before the contents page
* Exclude sections from auto contents page and metadata-based navigation
* OEBPS and other 'expected' subfolders within the EPUB

Development is done against Node v15.6.0 since v3.0.0 (February 2021).
*Node v10.3 or later* should work fine.

## Breaking changes over v2

* In v2 the cover image was specified as a parameter when the document is first constructed
  * In v3 that parameter is removed and becomes a `cover` metadata entry instead
  * As a bonus, cover images should now work for `jpg` and `gif` as well as `png`
* It now uses *async/await* and so requires newer versions of Node
  * Public methods are therefore called slightly differently
  * The actual content of generated EPUBs remains the same

* [You can view the change log here.](./CHANGELOG.md)
* [Developers of Nodepub itself can see some helpful information here.](./DEVELOPERS.md)

## Installing Nodepub

It's on npm at [https://www.npmjs.com/package/nodepub](https://www.npmjs.com/package/nodepub).
Add it as with any other module:

``` sh
npm i nodepub
```

Then import it for use:

``` javascript
var nodepub = require('nodepub');
```

## Defining your EPUB

* Documents consist of *metadata* and *sections*
  * Metadata is an object with various properties detailing the book
  * Sections are chunks of HTML that can be thought of as chapters

Here's some sample metadata:

``` javascript
var metadata = {
  id: '278-123456789',
  cover: '../test/cover.jpg',
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
  showContents: false,
  contents: 'Table of Contents',
  source: 'http://www.kcartlidge.com',
  images: ['../test/hat.png']
};
```

* The `cover` should be an image as described in the bullet points at the top of this document
* The `series` and `sequence` are not recognised by many readers (the *Calibre* properties are used)
* The `genre` becomes the main subject in the final EPUB
* The `tags` also become subjects in the final EPUB
* For `published` note the *year-month-day* format
* The `language` is the short *ISO* language name (`en`, `fr`, `de` etc)
* The `showContents` option (default is `true`) lets you suppress the contents page
* The `images` array is where you refer to all images used inside the book. Within your section HTML you always link to one all-containing flat folder: `<img src="../images/hat.png" />`

Call the `document` method with the aforementioned metadata object detailing your book.

``` javascript
var epub = nodepub.document(metadata);
```

You also have the option to generate your own contents page. Full details on this are shown further down the page.

### Fill in the content

The bulk of the work is adding your content.

Call `addSection` on your new document with a title and the HTML contents for each section in turn (usually a section is a chapter), plus extra options as follows.

``` javascript
epub.addSection(title, content, excludeFromContents, isFrontMatter, overrideFilename);
```

| PARAMETER           | PURPOSE                          | DEFAULT |
| ------------------- | -------------------------------- | ------- |
| title (required)    | Table of contents entry          |         |
| content (required)  | HTML body text                   | -       |
| excludeFromContents | Hide from contents/navigation    | false   |
| isFrontMatter       | Places before any contents page  | false   |
| overrideFilename    | Section filename inside the EPUB |         |

For example:

``` javascript
epub.addSection('Copyright', copyright, false, true);
epub.addSection('Chapter 1', "<h1>One</h1><p>...</p>");
epub.addSection('Chapter 2', "<h1>One</h1><p>...</p>", false, false, 'chapter-2');
```

*Excluding from the contents page list* allows you to add content which does not appear either in the auto-generated HTML table of contents or the metadata contents used directly by ereaders/software. This is handy for example when adding a page at the end of the book with details of your other books - a common page which may not appear in the book contents.

*Flagging as front matter* still includes it but passes that flag into any custom content page generation function you may choose to provide. Front matter will also appear in your book ahead of the contents page when read linearly. Useful for dedication pages, for example.

*Override the filename within the generated EPUB* allows the filename (don't provide an extention) to be specified manually, which enhances internal linking across sections. This was always possible using the auto-generated filenames (eg `s2.xhtml`) but, whilst the naming was predictable, inserting a new section bumped further sections further along the sequence (so `s2` becomes `s3` instead), breaking internal links. Using a manually named section prevents that breakage.

This should only be relevant if you are doing those internal cross-section links; general works of fiction for example won't usually need this facility. See the end of chapter one's content and the definition of content two in the example folder for sample usage.

### Optionally add some extra CSS

You can inject basic CSS into your book.

``` javascript
epub.addCSS(`p { text-indent: 0; } p+p { text-indent: 0.75em; }`);
```

### You can also choose to make your own custom contents page

*A standard contents page is included automatically, but can be overridden.*
*You can also suppress the contents page entirely; see the metadata section above.*

You can create your own by passing a second parameter when creating a *document* - a function which is called when the contents page is being constructed. That function will be given details of all the links, and is expected to return HTML to use for the contents page.

```javascript
var makeContentsPage = (links) => {
  var contents = "<h1>Chapters</h1>";
  links.forEach((link) => {
    if (link.itemType !== "contents") {
      contents += "<a href='" + link.link + "'>" + link.title + "</a><br />";
    }
  });
  return contents;
};
var epub = nodepub.document(metadata, makeContentsPage);
```

The `links` array which is passed to your callback function consists of objects with the following properties:

* *title* - the title of the section being linked to
* *link* - the relative `href` within the EPUB
* *itemType* - one of 3 types, those being *front* for front matter, *contents* for the contents page, and *main* for the remaining sections
  * You can use this to omit front matter from the contents page if required

Your callback function should return a string of HTML which will form the body of the contents page.
The `example.js` mentioned in the next section shows this in action.

## Generating your EPUB

Note that Nodepub is *asynchronous*, actionable using `async`/`await`.

``` javascript
// DEFAULT: Using Nodepub when your code IS asynchronous.
await epub.writeEPUB('/folder', 'filename-without-extention');
```

``` javascript
// EDGE CASE: Using Nodepub when your code IS NOT asynchronous.
(async () => {
  try {
    await epub.writeEPUB('example', 'example');
  } catch (e) {
    console.log(e);
  }
})();
```

[For a full example, see example.js](./example/example.js), which uses Nodepub from *synchronous* code.

---

### Option 1 - Creating a complete EPUB file ready for distribution

This is the simplest option.

``` javascript
await epub.writeEPUB('/folder', 'filename-without-extention');
```

---

### Option 2 - Creating a folder containing all the files necessary to build the final EPUB yourself

If you need to do further work on your EPUB, this option writes the entire constituent files into a folder.
When you create your EPUB it should consist of this folder's contents zipped up and renamed, with the sole proviso that the first file in the zip should be the `mimetype` file (stored, *not* compressed).

``` javascript
await epub.writeFilesForEPUB('/folder-for-constituent-files');
```

---

### Option 3 - Creating a Javascript object containing all the filenames and content needed for the final EPUB

Finally, you can have the same set of content files returned to you directly for you to do what you want with (e.g. to store in a database).

``` javascript
const files = await epub.getFilesForEPUB();
```

This returns an array of objects, one per file, looking similar to the following:

``` javascript
const files = [{
  name: 'toc.xhtml', folder: 'OEBPF/content', compress: true, content: 'raw-content-to-write',
}];
```

The `content` may be HTML, plain text, or byte arrays for images. It is in a complete and final form.
Writing these to a renamed `zip` file, honouring the `compress` flag, with `mimetype` first, gives an EPUB.

---

## The full example

In the top folder (containing the `package.json` file) run the following.

``` javascript
npm run example
```

This will generate various outputs in the `example`folder.

---

## Substitutions within your book content

A simple form of text substitution is supported. At any point in your section's content you may include placeholders like `[[COPYRIGHT]]`. When the EPUB is generated any such placeholders which match the *capitalised* name of a *metadata* entry are replaced with the corresponding metadata value.

For example, you could have a "Thanks for Reading" page at the end of your book which has the following markup:

``` html
<p>Thanks for reading <strong>[[TITLE]]</strong> by <em>[[AUTHOR]]</em>.</p>
```

When the EPUB is produced and opened, if your metadata was set as per the book "The Hobbit" by "JRR Tolkien", then it will look like this:

---

Thanks for reading **The Hobbit** by *JRR Tolkien*.

---

This means you can re-use content across multiple books, or refer to the author/title/series/whatever at any point within the book without worrying about consistency or maintenance.

## Reminder

This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic omission checks are performed.
