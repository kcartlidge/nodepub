# CHANGE LOG

## 2020-04-14

- Merged `RELEASES.md` into here

## 2020-04-13 - v2.2.0

- Updated various package versions
- Added a change log file

## 2019-03-20 - v2.1.1

- Updated `package.json` to add `src` folder to `start` entry

## 2019-03-20 - v2.1.0

- Updated dependencies
- Restructured source folders
- Switched from Jasmine tests to Mocha
- Added *npm* scripts for running `eslint` and the example

Breaking changes:

- The `makeContentsPage` callback function will no longer receive the default markup as a second parameter.

---

## v2.0.7

- Thanks to [Harold Treen](https://github.com/haroldtreen) the API has switched to being asynchronous

## v1.0.7

- This version introduces stability at the expense of minor breaking changes, consisting almost entirely of renames from chapter to section but with some of the pre-generated pages of earlier versions eliminated. The result is more abstracted but also more flexible, whilst also retaining most of it's simplicity.
