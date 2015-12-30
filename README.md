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

* *Fuller documentation*. Currently looking at *example.js* is the ideal way to learn how to use this module.

* *Inline images*. You can already have a cover image so the base functionality is there, but I will be adding an option to insert an image at any point in the text.

* *Custom contents page*. It is expected that the caller will be able to provide a contents page callback handler to optionally override the built-in one. It will be provided with a list of the contents and expected to return HTML markup.

## Requirements

It's an NPM module and depends upon a couple of (mainstream) packages. No external dependencies.

## Installation

It's an npm module:

``` sh
npm install nodepub
```

## Tests and Example

To run the tests, in the top folder (containing the *package.json* file) run the following and check the inner test subfolder for both a resulting final EPUB and a subfolder of constituent files:

``` javascript
npm test
```

*Important Note about the Tests*

The tests mostly stub *fs* where used. However at one point they do actually write a final EPUB document as this also serves as an *example* of the resulting files.

This means that (a) the test process needs writes to the test folder and (b) an actual file is generated.
Whilst the *process* is tested, the final EPUB is not; it is manually tested via the [IDPF Validator](http://validator.idpf.org/).
The actual testing of an EPUB file is already sufficiently covered by the *epubcheck* that site uses.
It would be pretty simple to include the use of *epubcheck* as part of integration testing should the need arise.

In addition an *example.js* script is provided:

``` javascript
cd example
node example.js
```

This generates a more complete example EPUB document than the test, and is commented.

## Usage

*You may find it easier just to look at the `example.js` file.*

Using **nodepub** is straightforward. The HTML you provide for chapter contents should be for the body contents only (typically a sequence of *&lt;p>one paragraph of text&lt;/p>* lines or headers).

The sequence is:

1. Require the module and call *document()* with a metadata object detailing your book plus the path of a cover image.

1. Repeatedly call *addSection()* with a title and HTML contents, plus options for whether to exclude from the contents list and/or use as front matter.

1. Produce *one* of the following outputs:

	* Call *getFilesForEPUB()* if you want a simple array of file description and contents for storing in a database or further working through. This array will contain all needed files for a valid EPUB, along with their name, subfolder (if any) and a flag as to whether they should be compressed (a value of *false* should **not** be ignored).

	* Call *writeFilesForEPUB()* if you want to create a folder containing the complete files as mentioned above. You can edit these and produce an EPUB; simply zip the files and change the extention. For a valid EPUB the *mimetype* file **must** be added first and *must not* be compressed. Some validators will pass the file anyway; some ereaders will fail to read it.

	* Call *writeEPUB()*. This is the easiest way and also the only one guaranteed to produce valid EPUB output simply because the other two methods allow for changes and compression issues.

## Reminder

*This is a utility module, not a user-facing one. In other words it is assumed that the caller has already validated the inputs. Only basic ommission checks are performed*
