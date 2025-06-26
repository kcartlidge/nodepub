const path = require('path')
const { resolve } = require('path')
const fsPromises = require('fs').promises

/**
 * Asynchronous forEach variant.
 * @param {Array} arr - array to iterate over
 * @param {Function} cb - function to call: fn(item, index, collection)
 */
const forEachAsync = async (arr, cb) => {
  for (let index = 0; index < arr.length; index += 1) {
    await cb(arr[index], index, arr)
  }
}

/**
 * Create a folder, throwing an error only if the error is not that
 * the folder already exists. Effectively creates if not found.
 * @param {String} folder - folder to create
 */
const makeFolder = async (folder) => {
  await fsPromises.mkdir(folder)
    .catch((err) => {
      if (err && err.code !== 'EEXIST') {
        throw err
      }
      resolve()
    })
}

/**
 * Get the image mimetype based on the file name.
 * @param {String} filename - the filename to check (case-insensitive)
 * @returns the mimetype as a string (eg `image/png`)
 */
const getImageType = (filename) => {
  const imageExt = path.extname(filename).toLowerCase()
  let imageType = ''
  imageType = (imageExt === '.svg') ? 'image/svg+xml' : imageType
  imageType = (imageExt === '.png') ? 'image/png' : imageType
  imageType = (imageExt === '.jpg' || imageExt === '.jpeg') ? 'image/jpeg' : imageType
  imageType = (imageExt === '.gif') ? 'image/gif' : imageType
  imageType = (imageExt === '.tif' || imageExt === '.tiff') ? 'image/tiff' : imageType
  return imageType
}

module.exports = {
  forEachAsync,
  makeFolder,
  getImageType
}
