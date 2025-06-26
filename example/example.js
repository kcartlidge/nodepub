const nodepub = require('../src/index.js')

// Metadata example.
const metadata = {
  id: '278-123456789',
  cover: 'test/test-cover.png',
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
  contents: 'Chapters',
  showContents: true,
  source: 'http://www.kcartlidge.com',
  images: ['test/hat.png']
}

const copyright = `<h1>[[TITLE]]</h1>
<h2>[[AUTHOR]]</h2>
<h3>&copy; [[COPYRIGHT]]</h3>
<p>
  All rights reserved.
</p>
<p>
  No part of this book may be reproduced in any form or by any electronic or
  mechanical means, including information storage and retrieval systems, without
  written permission from the author, except where covered by fair usage or
  equivalent.
</p>
<p>
  This book is a work of fiction.
  Any resemblance to actual persons  (living or dead) is entirely coincidental.
</p>
`

const more = `<h1>More Books to Read</h1>
<h2>Thanks for reading <em>[[TITLE]]</em>.</h2>
<p>
  I hope you enjoyed the book, but however you felt please consider leaving a
  review where you purchased it and help other readers discover it.
</p>
<p>
  You can find links to more books (and often special offers/discounts) by
  visiting my site at <a href="http://kcartlidge.com/books">KCartlidge.com/books</a>.
</p>
`

const about = `<h1>About the Author</h1>
<p>
  This is just some random blurb about the author.
</p>
<p>
  You can find more at the author's site.
</p>
<p>
  Oh, and here's a picture of a hat:
</p>
<p>
  <img src="../images/hat.png" alt="A hat." />
</p>
`

// Dummy text (lorem ipsum).
let lipsum = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>'
for (let i = 0; i < 3; i += 1) {
  lipsum += lipsum
}

// Optional override to replace auto-generated contents page.
// If not required, just drop it from the 'var epub=' call below.
const generateContentsPage = (links) => {
  let contents = '<h1>Chapters</h1>'
  links.forEach((link) => {
    // Omit all but the main pages.
    if (link.itemType === 'main') {
      if (link.title === 'More Books to Read') {
        contents += '<div> &nbsp;</div>'
      }
      contents += `<div><a href='${link.link}'>${link.title}</a></div>`
    }
  })
  return contents
}

// Set up the EPUB basics.
const epub = nodepub.document(metadata, generateContentsPage)
epub.addCSS(`body { font-family:Verdana,Arial,Sans-Serif; font-size:11pt; }
#title,#title h1,#title h2,#title h3 { text-align:center; }
h1,h3,p { margin-bottom:1em; }
h2 { margin-bottom:2em; }
p { text-indent: 0; }
p+p { text-indent: 0.75em; }`)

// Add some front matter.
epub.addSection('Title Page', "<div id='title'><h1>[[TITLE]]</h1><h2>Book <strong>[[SEQUENCE]]</strong> of <em>[[SERIES]]</em></h2><h3>[[AUTHOR]]</h3><p> &nbsp;</p><p>&copy; [[COPYRIGHT]]</p></div>", true, true)
epub.addSection('Copyright', copyright, false, true, 'copyright-page')

// Add some content.
epub.addSection('Chapter 1', `<h1>One</h1>${lipsum}<p><a href='chapter2.xhtml'>A test internal link</a>.</p>`)
epub.addSection('Chapter 2', `<h1>Two</h1>${lipsum}`, false, false, 'chapter2')
epub.addSection('Chapter 2a', `<h1>Two (A)</h1><p><strong>This chapter does not appear in the contents.</strong></p>${lipsum}`, true)
epub.addSection('Chapter 3', `<h1>Three</h1><p>Here is a sample list.</p><ul><li>Sample list item one.</li><li>Sample list item two.</li><li>Sample list item three.</li></ul>${lipsum}`)
epub.addSection('More Books to Read', more)
epub.addSection('About the Author', about);

// Generate the result.
(async () => {
  try {
    console.log('Generating a stand-alone EPUB.')
    await epub.writeEPUB('example', 'example')
  } catch (e) {
    console.log('ERROR')
    console.log(e)
  }
})();

// Also write the structure both for debugging purposes and to provide sample output in GitHub.
(async () => {
  try {
    console.log('Generating a collection of EPUB constituent files.')
    await epub.writeFilesForEPUB('example/example-EPUB-files')
  } catch (e) {
    console.log('ERROR')
    console.log(e)
  }
})()
