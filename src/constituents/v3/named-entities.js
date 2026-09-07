/**
 * Common HTML named entities for EPUB 3 XML.
 * Matches are case-insensitive. XML predefined names are rewritten to
 * lowercase; the rest of this list become numeric character references.
 * EPUB 3 documents natively allow only these:
 * - &amp; &lt; &gt; &quot; &apos;
 * Any other named entities which aren't transformed here will result in
 * validation errors.
 */
const CODEPOINTS = {
  nbsp: 160,
  cent: 162,
  pound: 163,
  yen: 165,
  sect: 167,
  copy: 169,
  laquo: 171,
  reg: 174,
  deg: 176,
  plusmn: 177,
  para: 182,
  middot: 183,
  raquo: 187,
  frac14: 188,
  frac12: 189,
  frac34: 190,
  times: 215,
  divide: 247,
  ndash: 8211,
  mdash: 8212,
  lsquo: 8216,
  rsquo: 8217,
  ldquo: 8220,
  rdquo: 8221,
  bull: 8226,
  hellip: 8230,
  euro: 8364,
  trade: 8482
}

const XML_PREDEFINED = {
  amp: true,
  lt: true,
  gt: true,
  quot: true,
  apos: true
}

/**
 * Normalise named entities in XML text.
 * @param {String} xml
 * @returns {String}
 */
const expand = (xml) => xml.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name) => {
  const lower = name.toLowerCase()
  if (XML_PREDEFINED[lower]) return `&${lower};`
  const codepoint = CODEPOINTS[lower]
  if (codepoint == null) return match
  return `&#${codepoint};`
})

module.exports = expand
