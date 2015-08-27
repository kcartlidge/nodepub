#!/usr/bin/nodejs

var fs = require('fs');
var lipsum = '' + fs.readFileSync('lorem-ipsum.txt');

// Create a book.
var epub = require('../index').document({
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
	cover: 'example-cover.png',
	description: 'An example book.',
	thanks: "Thanks for reading <em>[[TITLE]]</em>. If you enjoyed it please consider leaving a review where you purchased it.",
	linkText: "See more books and register for special offers here.",
	bookPage: "https://github.com/kcartlidge/node-makepub",
	showChapterNumbers: true,
	includeCopyrightPage: true
});

// Add some content.
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
epub.writeFilesForEPUB('./example');

// Write a complete EPUB.
epub.writeEPUB({}, '.', 'example', function() { console.log('\nFinished.\n'); });

