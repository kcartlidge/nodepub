const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const zip = require('archiver');
const { resolve } = require('path');
const structuralFiles = require('./constituents/structural.js');
const markupFiles = require('./constituents/markup.js');

// Asynchronous forEach variant.
const forEachAsync = async (arr, cb) => {
  for (let index = 0; index < arr.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await cb(arr[index], index, arr);
  }
};

// Create a folder, throwing an error only if the error is not that
// the folder already exists. Effectively creates if not found.
const makeFolder = async (topPath) => {
  await fsPromises.mkdir(topPath)
    .catch((err) => {
      if (err && err.code !== 'EEXIST') {
        throw err;
      }
      resolve();
    });
};

// Construct a new document.
const document = (metadata, generateContentsCallback) => {
  const self = this;
  self.CSS = '';
  self.sections = [];
  self.images = [];
  self.metadata = metadata;
  self.generateContentsCallback = generateContentsCallback;
  self.filesForTOC = [];
  self.coverImage = '';

  // Basic validation.
  const required = ['id', 'title', 'author', 'genre', 'cover'];
  if (metadata == null) throw new Error('Missing metadata');
  required.forEach((field) => {
    const prop = metadata[field];
    if (prop == null || typeof (prop) === 'undefined' || prop.toString().trim() === '') throw new Error(`Missing metadata: ${field}`);
    if (field === 'cover') {
      self.coverImage = prop;
    }
  });

  // Add a new section entry (usually a chapter) with the given title and
  // (HTML) body content. Optionally excludes it from the contents page.
  // If it is Front Matter then it will appear before the contents page.
  self.addSection = (title, content, excludeFromContents, isFrontMatter) => {
    self.sections.push({
      title,
      content,
      excludeFromContents: excludeFromContents || false,
      isFrontMatter: isFrontMatter || false,
    });
  };

  // Add a CSS file to the EPUB. This will be shared by all sections.
  self.addCSS = (content) => {
    self.CSS = content;
  };

  // Gets the number of sections added so far.
  self.getSectionCount = () => self.sections.length;

  // Gets the files needed for the EPUB, as an array of objects.
  // Note that 'compress:false' MUST be respected for valid EPUB files.
  self.getFilesForEPUB = async () => {
    const syncFiles = [];
    const asyncFiles = [];

    // Required files.
    syncFiles.push({
      name: 'mimetype', folder: '', compress: false, content: structuralFiles.getMimetype(),
    });
    syncFiles.push({
      name: 'container.xml', folder: 'META-INF', compress: true, content: structuralFiles.getContainer(self),
    });
    syncFiles.push({
      name: 'ebook.opf', folder: 'OEBPF', compress: true, content: structuralFiles.getOPF(self),
    });
    syncFiles.push({
      name: 'navigation.ncx', folder: 'OEBPF', compress: true, content: structuralFiles.getNCX(self),
    });
    syncFiles.push({
      name: 'cover.xhtml', folder: 'OEBPF', compress: true, content: markupFiles.getCover(self),
    });

    // Optional files.
    syncFiles.push({
      name: 'ebook.css', folder: 'OEBPF/css', compress: true, content: markupFiles.getCSS(self),
    });
    for (let i = 1; i <= self.sections.length; i += 1) {
      syncFiles.push({
        name: `s${i}.xhtml`, folder: 'OEBPF/content', compress: true, content: markupFiles.getSection(self, i),
      });
    }

    // Table of contents markup.
    syncFiles.push({
      name: 'toc.xhtml', folder: 'OEBPF/content', compress: true, content: markupFiles.getTOC(self),
    });

    // Extra images - add filename into content property and prepare for async handling.
    const coverFilename = path.basename(self.coverImage);
    asyncFiles.push({
      name: coverFilename, folder: 'OEBPF/images', compress: true, content: self.coverImage,
    });
    self.metadata.images.forEach((image) => {
      const imageFilename = path.basename(image);
      asyncFiles.push({
        name: imageFilename, folder: 'OEBPF/images', compress: true, content: image,
      });
    });

    // Now async map to get the file contents.
    await forEachAsync(asyncFiles, async (file) => {
      const data = await fsPromises.readFile(file.content);
      const loaded = {
        name: file.name, folder: file.folder, compress: file.compress, content: data,
      };
      syncFiles.push(loaded);
    });

    // Return with the files.
    return syncFiles;
  };

  // Writes the files needed for the EPUB into a folder structure.
  // For valid EPUB files the 'mimetype' MUST be the first entry in an EPUB and uncompressed.
  self.writeFilesForEPUB = async (folder) => {
    const files = await self.getFilesForEPUB();
    await makeFolder(folder);
    await forEachAsync(files, async (file) => {
      if (file.folder.length > 0) {
        const f = `${folder}/${file.folder}`;
        await makeFolder(f);
        await fsPromises.writeFile(`${f}/${file.name}`, file.content);
      } else {
        await fsPromises.writeFile(`${folder}/${file.name}`, file.content);
      }
    });
  };

  // Writes the EPUB. The filename should not have an extention.
  self.writeEPUB = async (folder, filename) => {
    const files = await self.getFilesForEPUB();

    // Start creating the zip.
    await makeFolder(folder);
    const output = fs.createWriteStream(`${folder}/${filename}.epub`);
    const archive = zip('zip', { store: false });
    archive.on('error', (archiveErr) => {
      throw archiveErr;
    });

    await new Promise((resolveWrite) => {
      // Wait for file descriptor to be written.
      archive.pipe(output);
      output.on('close', () => resolveWrite());

      // Write the file contents.
      files.forEach((file) => {
        if (file.folder.length > 0) {
          archive.append(file.content, { name: `${file.folder}/${file.name}`, store: !file.compress });
        } else {
          archive.append(file.content, { name: file.name, store: !file.compress });
        }
      });

      // Done.
      archive.finalize();
    });
  };

  return self;
};

exports.document = document;
