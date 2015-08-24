
var fs = require('fs');
var lipsum = '' + fs.readFileSync('lorem-ipsum.txt');

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
	description: 'A sample book.',
	includeCopyrightPage: false
});

// Add some content.
epub.addChapter('Introduction','<p>This is an introduction.</p>');
for(var n=1; n<=10; n++) {
	epub.addChapter('Chapter ' + n, lipsum);
}

// List the files generated.
console.log('\nFiles created:\n');
var files = epub.getFilesForEPUB();
for(var i in files) {
	console.log('  ', files[i].name, ' -- ', files[i].content.length, 'bytes');
};

// Write the contents of the EPUB file into a folder (as an FYI or if you wish to modify it).
epub.writeFilesForEPUB('./sample');

// Write a complete EPUB.
epub.writeEPUB('.', 'sample', function() { console.log('\nFinished.\n'); });

