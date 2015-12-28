var makepub = require("../index.js"), _ = require("underscore");

// Metadata example.
var metadata = {
	id: '12345678',
	title: 'Unnamed Document',
	series: 'My Series',
	sequence: 1,
	author: 'Anonymous',
	fileAs: 'Anonymous',
	genre: 'Non-Fiction',
	tags: 'Sample,Example,Test',
	copyright: 'Anonymous, 1980',
	publisher: 'My Fake Publisher',
	published: '2000-12-31',
	language: 'en',
	description: 'A test book.',
	contents: 'Chapters'
};

// Dummy text (lorem ipsum).
var lipsum = "<p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</em></p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>";

// Set up the EPUB basics.
var epub = makepub.document(metadata, "../test/test-cover.png");
epub.addCSS("body{font-family:Verdana,Arial,Sans-Serif;font-size:12pt;}");

// Add some front matter.
epub.addSection('Title Page', "<h1>[[TITLE]]</h1><h2>[[AUTHOR]]</h2><h3>Book <strong>[[SEQUENCE]]</strong> of <em>[[SERIES]]</em></h3><p> &nbsp;</p><p>&copy; [[COPYRIGHT]]</p>", true, true);
epub.addSection('Copyright', "<h1>Copyright</h1>" + lipsum, true, true);

// Add some content.
epub.addSection('Chapter 1', "<h1>One</h1>" + lipsum);
epub.addSection('Chapter 2', "<h1>Two</h1>" + lipsum);
epub.addSection('Chapter 2a', "<h1>Two (A)</h1>" + lipsum, true);
epub.addSection('Chapter 3', "<h1>Three</h1>" + lipsum);

// Generate the result.
epub.writeEPUB(function (e) {
	console.log(e);
}, '.', 'example', function () {
	console.log("Okay.")
});
