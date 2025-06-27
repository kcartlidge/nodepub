// Sample content
const lipsum = '<h1>Chapter Title Goes Here</h1><p><em>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse mattis iaculis pharetra. Proin malesuada tortor ut nibh viverra eleifend.</em></p><p>Duis efficitur, arcu vitae viverra consectetur, nisi mi pharetra metus, vel egestas ex velit id leo. Curabitur non tortor nisi. Mauris ornare, tellus vel fermentum suscipit, ligula est eleifend dui, in elementum nunc risus in ipsum. Pellentesque finibus aliquet turpis sed scelerisque. Pellentesque gravida semper elit, ut consequat est mollis sit amet. Nulla facilisi.</p>'

/**
 * Return a 0+ array of entries in the collection matching the condition.
 * @param {Array} collection - an array of objects
 * @param {Function} condition - a matching predicate: `(f) => f.id === 3`
 * @returns an array of 0 or more matches
 */
const find = (collection, condition) => {
  // forEach is fine here as we don't attempt to exit early
  const result = []
  collection.forEach((f) => {
    if (condition(f)) result.push(f)
  })
  return result
}

/**
 * Return the `content` property of the first entry in the collection
 * matching the condition. If none, the `defaultValue` is returned.
 * @param {Array} collection - an array of objects
 * @param {Function} condition - a matching predicate: `(f) => f.id === 3`
 * @param {String} defaultValue - value to return if no match found (defaults to '')
 * @returns the matching entry's `content` or the `defaultValue`
 */
const findFirstContent = (collection, condition, defaultValue = '') => {
  // forEach doesn't work due to the early exit requirement
  for (const f of collection) {
    if (condition(f)) return f.content
  }
  return defaultValue
}

/**
 * Fetch a metadata object with valid data.
 * @returns a metadata object with valid data
 */
const validMetadata = () => {
  return {
    id: Date.now(),
    cover: 'test/test-cover.png',
    title: 'Test Document',
    series: 'My Series',
    sequence: 1,
    author: 'Nodepub',
    fileAs: 'Nodepub',
    genre: 'Non-Fiction',
    tags: 'Sample,Example,Test',
    copyright: 'Nodepub, 1980',
    publisher: 'My Fake Publisher',
    published: '2000-12-31',
    language: 'en',
    description: 'A test book.',
    contents: 'Contents',
    showContents: true,
    source: 'http://www.kcartlidge.com',
    images: []
  }
}

module.exports = {
  lipsum,
  find,
  findFirstContent,
  validMetadata
}
