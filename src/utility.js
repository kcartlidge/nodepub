const path = require('path');
const { resolve } = require('path');
const fsPromises = require('fs').promises;

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

// Get the image mimetype based on the file name.
const getImageType = (filename) => {
  const imageExt = path.extname(filename).toLowerCase();
  let imageType = '';
  imageType = (imageExt === '.svg') ? 'image/svg+xml' : imageType;
  imageType = (imageExt === '.png') ? 'image/png' : imageType;
  imageType = (imageExt === '.jpg' || imageExt === '.jpeg') ? 'image/jpeg' : imageType;
  imageType = (imageExt === '.gif') ? 'image/gif' : imageType;
  imageType = (imageExt === '.tif' || imageExt === '.tiff') ? 'image/tiff' : imageType;
  return imageType;
};

const getImageName = (image) => {
  if ((typeof image) === 'string') {
    return image;
  }
  return image.name;
};

module.exports = {
  forEachAsync,
  makeFolder,
  getImageType,
  getImageName,
};
