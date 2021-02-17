var path = require('path');

var markup = {

  getContents: function (document, overrideContents) {
    var result = "";
    result += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]";
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd' >[[EOL]]";
    result += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]";
    result += "  <head>[[EOL]]";
    result += "    <title>[[CONTENTS]]</title>[[EOL]]";
    result += "    <link rel='stylesheet' type='text/css' href='../css/ebook.css' />[[EOL]]";
    result += "  </head>[[EOL]]";
    result += "  <body>[[EOL]]";

    if (overrideContents) {
      result += overrideContents;
    } else {
      result += "    <div class='contents'>[[EOL]]";
      result += "      <h1>[[CONTENTS]]</h1>[[EOL]]";
      for (var i = 1; i <= document.sections.length; i++) {
        var section = document.sections[i - 1];
        if (!section.excludeFromContents) {
          var title = section.title;
          result += `      <a href='s${  i  }.xhtml'>${  title  }</a><br/>[[EOL]]`;
        }
      }
      result += "    </div>[[EOL]]";
    }
    result += "  </body>[[EOL]]";
    result += "</html>[[EOL]]";
    return result;
  },

  getCover: function (document) {
    var coverFilename = path.basename(document.coverImage);
    var result = "";
    result += "<?xml version='1.0' encoding='UTF-8' ?>[[EOL]]";
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN'  'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
    result += "<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en'>[[EOL]]";
    result += "<head>[[EOL]]";
    result += "  <title>[[TITLE]]</title>[[EOL]]";
    result += "  <style type='text/css'>[[EOL]]";
    result += "    body { margin: 0; padding: 0; text-align: center; }[[EOL]]";
    result += "    .cover { margin: 0; padding: 0; font-size: 1px; }[[EOL]]";
    result += "    img { margin: 0; padding: 0; height: 100%; }[[EOL]]";
    result += "  </style>[[EOL]]";
    result += "</head>[[EOL]]";
    result += "<body>[[EOL]]";
    result += `  <div class='cover'><img style='height: 100%;width: 100%;' src='images/${  coverFilename  }' alt='Cover' /></div>[[EOL]]`;
    result += "</body>[[EOL]]";
    result += "</html>[[EOL]]";
    return result;
  },

  getSection: function (document, sectionNumber) {
    var section = document.sections[sectionNumber - 1];
    var title = section.title;
    var content = section.content;

    var result = "";
    result += "<?xml version='1.0' encoding='utf-8'?>[[EOL]]";
    result += "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>[[EOL]]";
    result += "<html xmlns='http://www.w3.org/1999/xhtml'>[[EOL]]";
    result += "  <head profile='http://dublincore.org/documents/dcmi-terms/'>[[EOL]]";
    result += "    <meta http-equiv='Content-Type' content='text/html;' />[[EOL]]";
    result += `    <title>[[TITLE]] - ${  title  }</title>[[EOL]]`;
    result += "    <meta name='DCTERMS.title' content='[[TITLE]]' />[[EOL]]";
    result += "    <meta name='DCTERMS.language' content='[[LANGUAGE]]' scheme='DCTERMS.RFC4646' />[[EOL]]";
    result += "    <meta name='DCTERMS.source' content='MFW' />[[EOL]]";
    result += "    <meta name='DCTERMS.issued' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]";
    result += "    <meta name='DCTERMS.creator' content='[[AUTHOR]]'/>[[EOL]]";
    result += "    <meta name='DCTERMS.contributor' content='' />[[EOL]]";
    result += "    <meta name='DCTERMS.modified' content='{$issued}' scheme='DCTERMS.W3CDTF'/>[[EOL]]";
    result += "    <meta name='DCTERMS.provenance' content='' />[[EOL]]";
    result += "    <meta name='DCTERMS.subject' content='[[GENRE]]' />[[EOL]]";
    result += "    <link rel='schema.DC' href='http://purl.org/dc/elements/1.1/' hreflang='en' />[[EOL]]";
    result += "    <link rel='schema.DCTERMS' href='http://purl.org/dc/terms/' hreflang='en' />[[EOL]]";
    result += "    <link rel='schema.DCTYPE' href='http://purl.org/dc/dcmitype/' hreflang='en' />[[EOL]]";
    result += "    <link rel='schema.DCAM' href='http://purl.org/dc/dcam/' hreflang='en' />[[EOL]]";
    result += "    <link rel='stylesheet' type='text/css' href='../css/ebook.css' />[[EOL]]";
    result += "  </head>[[EOL]]";
    result += "  <body>[[EOL]]";
    result += `    <div id='s${  sectionNumber  }'></div>[[EOL]]`;
    result += "    <div>[[EOL]]";

    var lines = content.split('\n');
    for (var lineIdx in lines) {
      var line = lines[lineIdx];
      if (line.length > 0) {
        result += `      ${  line  }[[EOL]]`;
      }
    }

    result += "    </div>[[EOL]]";
    result += "  </body>[[EOL]]";
    result += "</html>[[EOL]]";
    return result;
  }

};

module.exports = markup;
