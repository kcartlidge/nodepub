![Mocha](https://img.shields.io/badge/mocha-passing-success)
![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-success.svg)

# Nodepub

Create valid EPUB 2 ebooks with metadata, contents, cover, and images.

*This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic sanity checks are performed.*

## Contents

- [About Nodepub](#about-nodepub)
- [Installation](#installation)
- [Creating an EPUB](#creating-an-epub)
  - [Setting the Metadata](#setting-the-metadata)
    - [Example Metadata](#example-metadata)
  - [Adding Contents](#adding-contents)
    - [Text Substitutions](#text-substitutions)
  - [Including Images](#including-images)
  - [Changing the Styling](#changing-the-styling)
  - [Custom Table of Contents](#custom-table-of-contents)
  - [Generating Output](#generating-output)
    - [Ready-to-Use EPUB](#ready-to-use-epub)
    - [Folder of EPUB-Ready Files](#folder-of-epub-ready-files)
    - [Object with All Content](#object-with-all-content)
    - [Using in Non-Async Code](#using-in-non-async-code)
- [Validating EPUBs](#validating-epubs)
- [A Full Example](#a-full-example)
- [Breaking changes over v2](#breaking-changes-over-v2)


## About Nodepub

Nodepub is a **Node** module which can be used to create **EPUB 2** documents.

- Files pass the *IDPF online validator*
  - The IDPF tool is no longer online - see the [Validating EPUBs](#validating-epubs) section for an alternative
- Files meet Sigil's preflight checks
- Files open fine in iBooks, Adobe Digital Editions, and Calibre
- Files open fine with the Kobo H20 ereader
- Files are fine as *KindleGen* input
- PNG/JPEG cover images
- Inline images within the EPUB
  - See [Including Images](#including-images) for supported formats
- Custom CSS can be provided
- Optionally generate your own contents page
- Front matter before the contents page
- Exclude sections from auto contents page and metadata-based navigation
- OEBPS and other 'expected' subfolders within the EPUB

Development is done against Node v15.6.0 since v3.0.0 (February 2021).
*Node v10.3 or later* should work fine.

## Installation

It's an [npm package](https://www.npmjs.com/package/nodepub).
To install it:

``` sh
npm i nodepub
```

Then import it for use:

``` javascript
var nodepub = require('nodepub');
```

## Creating an EPUB

- Documents consist of *metadata*, *sections*, and *images*
  - Metadata is provided in the form of an object with various properties detailing the book
  - Sections are chunks of HTML where each represent a chapter, front/back matter, or similar
  - Images are inlined image files that can appear within the body of the EPUB
    - The cover is a special image which is declared within the metadata

### Setting the Metadata

The first task is to declare the metadata which describes your EPUB. You use that metadata when creating a new document.

``` javascript
var epub = nodepub.document(metadata);
```

#### Example Metadata

``` javascript
var metadata = {
  id: '278-123456789',
  cover: '../test/cover.jpg',
  title: 'Unnamed Document',
  series: 'My Series',
  sequence: 1,
  author: 'KA Cartlidge',
  fileAs: 'Cartlidge, KA',
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

- `cover` should be the filename of an image - recommendation is 600x800, 600x900, or similar
- `series` and `sequence` are not recognised by many readers (it sets the properties used by *Calibre*)
- `fileAs` is the sortable version of the `author`, which is usually by last name
- `genre` becomes the main subject in the final EPUB
- `tags` also become subjects in the final EPUB
- `published` is the data published - note the *year-month-day* format
- `language` is the short *ISO* language name (`en`, `fr`, `de` etc)
- `showContents` (default is `true`) lets you suppress the contents page
- `images` (an array) is where you refer to all images used inside the book - see [Including Images](#including-images) for details

### Adding Contents

There are two types of content. The type that appears as front/back matter (eg *Introduction* or *Epilogue*), and the type that forms regular content, usually a complete chapter. Each piece of content by default gets an entry in the table of contents.

Call `addSection` on your new document with a title and the HTML contents for each section in turn, plus extra options as follows.

``` javascript
epub.addSection(title, content, excludeFromContents, isFrontMatter, overrideFilename);
```

| PARAMETER           | PURPOSE                          | DEFAULT |
| ------------------- | -------------------------------- | ------- |
| title (required)    | Table of contents entry text     |         |
| content (required)  | HTML body text                   |         |
| excludeFromContents | Hide from contents/navigation    | `false` |
| isFrontMatter       | Place before the contents page   | `false` |
| overrideFilename    | Section filename inside the EPUB |         |

For example:

``` javascript
epub.addSection('Copyright', copyright, false, true);
epub.addSection('Chapter 1', "<h1>Chapter One</h1><p>...</p>");
epub.addSection('Chapter 2', "<h1>Chapter Two</h1><p>...</p>", false, false, 'chapter-2');
epub.addSection('Epilogue', epilogueText, true);
```

For the above the *Copyright* page will appear as front matter ahead of the table of contents, *Chapter One* will be standard text, *Chapter Two* will also be standard text but within the EPUB itself the filename used is specifically overridden (often to provide stable interlinking), and the *Epilogue* appears at the end but is excluded from the contents page.

In detail:

- `excludeFromContents` allows you to add content which does not appear either in the auto-generated HTML table of contents or the metadata contents used directly by ereaders/software. This is handy for example when adding a page at the end of the book with details of your other books.
- `isFrontMatter` means content is included as normal but this flag is passed into any custom content page generation function you may choose to provide (see [Custom Table of Contents](#custom-table-of-contents)). Front matter will also appear in your book *ahead* of the contents page when read linearly. Useful for dedication pages for example.
- `overrideFilename` allows the filename (don't provide an extention) to be specified manually, which stabilises internal linking across sections. This was always possible using the auto-generated filenames (eg `s2.xhtml`), but whilst the naming was predictable inserting a new section bumped following sections further along the sequence (so `s2` becomes `s3` instead), which breaks internal links. Using a manually named section prevents that breakage by guaranteeing the link will always go to the expected place. This should only be relevant if you are doing internal cross-section links; general works of fiction for example won't usually need this facility.

#### Text Substitutions

A simple form of text substitution is supported. At any point in your content you may include placeholders like `[[COPYRIGHT]]`. When the EPUB is generated any such placeholders which match the *capitalised* name of a *metadata* entry are replaced with the corresponding metadata value.

For example, you could have a *"Thanks for Reading"* page at the end of your book which has the following content:

``` html
<p>Thanks for reading <strong>[[TITLE]]</strong> by <em>[[AUTHOR]]</em>.</p>
```

When the EPUB is produced if your metadata sets a `title:` of *"The Hobbit"* and an `author:` of *"JRR Tolkien"* then it will generate this:

---

Thanks for reading **The Hobbit** by *JRR Tolkien*.

---

This means you can re-use content across multiple books, relying on the text subsitution to update that content based on the current book's metadata. Or you can refer to the author/title/series/whatever at any point within the book without worrying about consistent spellings for example.

### Including Images

In [Setting the Metadata](#setting-the-metadata) the example metadata included an image:

``` javascript
metadata.images = ['../test/hat.png'];
```

This part of the metadata is an array of filenames which locate the source images on your system.
(I strongly recommend you use relative paths in order to allow for documents being produced on different systems having different folder layouts.)

These images are automatically added into the EPUB when it is generated. They always go in an `images` folder internally. As they all go into the same folder they *should have unique filenames*.

To include the images in your content the HTML should refer to this internal folder rather than the original source folder, so for example `<img src="../images/hat.png" />` in the above example.

- Accepted image types are `.svg`, `.png`, `.jpg`/`.jpeg`, `.gif`, and `.tif`/`.tiff`.

### Changing the Styling

You can inject basic CSS into your book. This allows you to override the basic styling to change how it looks.
You should use this sparingly - there is inconsistent CSS support across ereader devices/software.

For example the following ensures that in a flow of multiple paragraphs the first starts at the left margin whilst the second and subsequent paragraphs have their first line indented a little:

``` javascript
epub.addCSS(`p { text-indent: 0; } p+p { text-indent: 0.75em; }`);
```

If you want to see the raw HTML in order to help with creating CSS then note that an EPUB file is just a ZIP file with pre-determined contents. If you expand it (you may need to rename it to a `.zip` file first) then you can see the individual section files inside.

Alternatively see [Folder of EPUB-Ready Files](#folder-of-epub-ready-files) for how to write the EPUB innards into a folder instead of as a single file.

### Custom Table of Contents

There is a default table of contents added into all generated EPUBs.
In addition to suppressing it (see [Setting the Metadata](#setting-the-metadata)) you can also create it yourself.

You do this by providing a callback function, a standard Javascript function which will be given a breakdown of the EPUB contents and is expected to return ready-to-use HTML for the table of contents page. You do this by passing that function as the second parameter when creating your document.

``` javascript
var epub = nodepub.document(metadata, makeContentsPage);
```

The above specifies a `makeContentsPage` function should be used to create the table of contents.
Here's an example:

``` javascript
var makeContentsPage = (links) => {
  var contents = "<h1>Chapters</h1>";
  links.forEach((link) => {
    if (link.itemType !== "contents") {
      contents += "<a href='" + link.link + "'>" + link.title + "</a><br />";
    }
  });
  return contents;
};
```

You can see it is given a set of `links` and from them it composes HTML consisting of a `h1` title and a set of `a` tags separated by line breaks (`br`). This function is called every time a table of contents is needed during document generation.

The `links` parameter is an *array* which consists of *objects* with the following properties:

- `title` is the title of the section being linked to
- `link` is the relative `href` within the EPUB
- `itemType` is one of 3 types, those being *front* for front matter, *contents* for the contents page, and *main* for the remaining sections
  - You can use this for example to omit front matter from the contents page

### Generating Output

Having defined your document generating an EPUB from it can be as simple or complex as you like.
That's because you have a choice of three options.

- [For a full example, see example.js](./example/example.js) which uses Nodepub from *synchronous* code

#### Ready-to-Use EPUB

This is the easiest option, as all the work is done for you.

``` javascript
await epub.writeEPUB(folder, filenameWithoutExtention);
```

#### Folder of EPUB-Ready Files

If you want to do further work on your EPUB innards, this option writes the entire constituent files into a folder.

``` javascript
await epub.writeFilesForEPUB(folderForConstituentFiles);
```

If you use these files to create a subsequent EPUB yourself, that EPUB should consist of this output folder's contents zipped up and renamed but with the sole proviso that the first file in the zip should be the `mimetype` file and it should be *stored* not *compressed*.

#### Object with All Content

You can have the EPUB innards returned to you directly for you to do what you want with (eg to store in a database).

``` javascript
const files = await epub.getFilesForEPUB();
```

This returns an array of objects, one per file, similar to the following:

``` javascript
const files = [{
  name: 'toc.xhtml', folder: 'OEBPF/content', compress: true, content: 'raw-content-to-write',
}];
```

These are the *complete* files for the EPUB and consist of *more* than your original sections that you added.
The `content` may be HTML, plain text, or byte arrays (for images). It is in a complete and final form and should be persisted exactly as is.

Writing these `files` entries to a ZIP file (named as an `.epub`) gives an EPUB document.
For that EPUB to work you *must* (a) honour the `compress` flag and (b) add the `mimetype` entry *first*.

#### Using in Non-Async Code

Nodepub is *asynchronous*, actionable using `async`/`await`.
The following is an example of how you might use the easy EPUB generation option from within *synchronous* code instead.

``` javascript
// Asynchronous version:
await epub.writeEPUB(folder, filenameWithoutExtention);

// Synchronous equivalent:
(async () => {
  try {
    await epub.writeEPUB(folder, filenameWithoutExtention);
  } catch (e) {
    console.log(e);
  }
})();
```

## Validating EPUBs

Previously files were validated by the IDPF online validator, but that page was taken down a while ago.
As an alternative, **Pagina** offer a cross-platform EPUB validation tool.

It's a desktop app and [they provide installation instructions here](https://pagina.gmbh/startseite/leistungen/publishing-softwareloesungen/epub-checker/).

The instructions are in German initially, but the option is there to switch to English.
In essence it reduces to installing OpenJDK then downloading and running their app.

The Pagina app verifies using *EPUBCheck* so it gives industry-standard results.

## A Full Example

In the top folder (the one containing the `package.json` file) run the following:

``` javascript
npm run example
```

This runs in [the `example` folder](./example) using the code in [`example/example.js`](./example/example.js) to generate a final EPUB. It will also create a subfolder containing the raw files used to produce that EPUB (omitted from source control).

## Breaking changes over v2

- In v2 the cover image was specified as a parameter when the document is first constructed
  - In v3 that parameter is removed and becomes a `cover` metadata entry instead
  - As a bonus, cover images should now work for `jpg` and `gif` as well as `png`
- It now uses *async/await* and so requires newer versions of Node
  - Public methods are therefore called slightly differently
  - The actual content of generated EPUBs remains the same

- [You can view the change log here.](./CHANGELOG.md)
- [Developers of Nodepub itself can see some helpful information here.](./DEVELOPERS.md)
