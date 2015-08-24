# makepub

Makepub is a **Node** module which can be used to create **EPUB** documents. The resultant files are designed to pass the [IDPF online validator](http://validator.idpf.org) and Sigil's preflight checks. They should also open correctly in iBooks (as this is the most picky mainstream reader) and be suited for upload into the Amazon KDP and Kobo Writing Life sites. For those using KDP who wish to do a conversion locally, it should also satisfy KindleGen.

*This module has only been tested via the require statement in the sample-usage.js file - this should be sufficient but further testing will follow shortly. Files have not yet been verified against KDP/Kobo, although the same generation methodology has been used successfully in the past so this also should occur shortly.*

Resultant EPUBs can be generated to one of three levels of completeness:

1. A complete .epub file ready for distribution
2. A folder containing all the files necessary to build the final EPUB
3. A Javascript object containing all the filenames and content needed for the final EPUB

The module has no concept of how the original content is obtained; it is passed a metadata object at creation after which content is added sequentially by the caller. There is no automatic pre-processing of content files such as Markdown as the module expects to be given *HTML* to work with and it is trivial for the caller to pre-process in advance by requiring a Markdown module, the Jade rendering engine or similar.

###Progress###

The generation of EPUBs to all three levels of completeness mentioned above is in place along with a sample script to show the usage. The codebase also includes both the resulting sample EPUB and the files that were joined to create it.

EPUBs generated pass the IDPF validator and display in the iBooks library (list view shows more metadata).

Cover images are included and must be in PNG format; I recommend 600x800 or an alternative of the same aspect ratio.

If you use the raw generated files to write the EPUB yourself, bear in mind that the **mimetype** file MUST be the first file in the archive and also MUST NOT be compressed. In simple terms, an EPUB is a renamed ZIP file where compression is optional apart from the mimetype file which should be added first using the 'store' option.

Note that ALL functions of the module are synchronous EXCEPT if you choose to use the option to create the complete EPUB (*writeEPUB*), which is internally synchronous whilst generating the file contents but for external purposes is asynchronous with a callback due to the nature of the *archiver* dependency used to create the final output. This is definitely an anti-pattern and will be fixed.

*Upcoming Changes*

* Splitting of the HTML templates into loadable template files.
* Tags, series and sequence in the metadata.
* Optional inclusion of scene names as subheaders.
* Allow CSS overriding; the current EPUBs are simple yet attractive, but I appreciate you may want to add your own styles.
* Inline images; you can already have a cover image so the base functionality is there, but I will be adding an option to insert an image at any point in the text. As each chapter's HTML is provided in advance by the caller, the links will already be in the markup so all that should be required is to copy the images themselves into a suitable place in the file and ensure they appear in the relevant EPUB structural files.
* Possible nested contents. This may not happen as it is extra work to support a feature that isn't really in scope. Chapters are understood and are added to the contents and the spine for navigation, and this works fine for fiction. There may however be a wish for sections within chapters (especially for non-fiction). The afore-mentioned scene headers may suffice.

### Sample Usage ###

Using **makepub** is straightforward. Note that the HTML you provide for chapter contents should be for the body contents only (typically a sequence of *&lt;p>one paragraph of text&lt;/p>* lines). You can use header tags, but I recommend no higher than *h3* be used. This may mean that if you produce HTML from a Markdown file you need to demote headers with a search and replace (*h1* becomes *h3*, *h2* becomes *h4* and so on - remember to demote the closing tags too, as incorrect content markup confuses some ereader software [eg iBooks]).

1. Require the module and call *document()* with a metadata object detailing your book.
2. Repeatedly call *addChapter()* with a title and HTML contents.
3. Call *getFilesForEPUB()* if you want a simple array of file description and contents for storing in a database or further working through. This array will contain all needed files for a valid EPUB, along with their name, subfolder (if any) and a flag as to whether they should be compressed (a value of *false* should **not** be ignored).
4. Call *writeFilesForEPUB()* if you want to create a folder containing the complete files as mentioned above. You can edit these and produce an EPUB; simply zip the files and change the extention. For a valid EPUB the *mimetype* file **must** be added first and *must not* be compressed. Some validators will pass the file anyway; some ereaders will fail to read it.
5. Call *writeEPUB()*. This is the easiest way and also the only one guaranteed to produce valid EPUB output simply because the other two methods allow for changes and compression issues.

**The Simplest Way**

```javascript
// Create a book.
var epub = require('./index').document({
	id: '12345678',
	title: 'Unnamed Document',
	author: 'Anonymous',
	fileAs: 'Anonymous',
	genre: 'Non-Fiction',
	copyright: 'Anonymous, 1980',
	publisher: 'My Fake Publisher',
	published: '2000-12-31',
	language: 'en',
	cover: 'sample-cover.png',
	description: 'A sample book.'
});

// Add some content.
var lipsum = "<p>Lorem ipsum dolor sit amet adipiscing.</p>";
epub.addChapter('In the Beginning', lipsum);
epub.addChapter('Setting the Scene', lipsum);
epub.addChapter('A Moment of Conflict', lipsum);
epub.addChapter('The Conclusion of Things', lipsum);

// Write a complete EPUB.
epub.writeEPUB('.', 'sample', function() { console.log('\nFinished.\n'); });
```

**More Manual Output Options**

```javascript
// Create a book.
var epub = require('./index').document({
	id: '12345678',
	title: 'Unnamed Document',
	author: 'Anonymous',
	fileAs: 'Anonymous',
	genre: 'Non-Fiction',
	copyright: 'Anonymous, 1980',
	publisher: 'My Fake Publisher',
	published: '2000-12-31',
	language: 'en',
	cover: 'sample-cover.png',
	description: 'A sample book.'
});

// Add some content.
var lipsum = "<p>Lorem ipsum dolor sit amet adipiscing.</p>";
epub.addChapter('In the Beginning', lipsum);
epub.addChapter('Setting the Scene', lipsum);
epub.addChapter('A Moment of Conflict', lipsum);
epub.addChapter('The Conclusion of Things', lipsum);

// List the files generated.
console.log('\nFiles created:\n');
var files = epub.getFilesForEPUB();
for(var i in files) {
	console.log('  ', files[i].name, ' -- ', files[i].content.length, 'bytes');
};

// Write the contents of the EPUB file into a folder (as an FYI or if you wish to modify it).
epub.writeFilesForEPUB('./sample');
```

**Note that this is a utility module, not a user-facing one. In other words it is assumed that whoever calls into *makepub* has already validated all inputs.**
