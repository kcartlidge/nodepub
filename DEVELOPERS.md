# For DEVELOPERS of Nodepub ONLY

*If you are just using Nodepub to generate books, you do not need to read this document.*

### Tests and example

In the top folder (containing the `package.json` file) run one of the following.

``` javascript
npm test
npm run example
```

### Code quality

In addition to the tests I use **ES Lint**.

``` javascript
npm run lint
```

This will highlight issues, and auto-fix what it can.
Many editors (e.g. VS Code) have ES Lint extentions that can also be automatically run on paste/save.

### Notes

* The tests mostly stub `fs`/`fsPromises` where used. However at one point they do actually write a final EPUB document. This means that (a) the test process needs write access to the test folder, and (b) an actual file is generated.
* Whilst the *process* of generating EPUBs is tested, the *final EPUB* is not; I have manually tested it via the [IDPF Validator](http://validator.idpf.org/). The actual testing of an EPUB file is already sufficiently covered by the *epubcheck* tool which that site uses, and I have not added it as an integration test.
* You may find it helpful to look at the `example/example.js` file.
* For viewing generated metadata and content try Calibre, iBooks, or similar.

## Automatic upgrading of dependencies to the latest

(Remember to run the tests and to check the generated books using (at least) the IDPF validator before committing.)

``` sh
npm install -g npm-check-updates
ncu -u
npm i
```
