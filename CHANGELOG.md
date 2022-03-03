# CHANGE LOG

## 2022-03-03 - v3.0.8

- #23 indent breaks `pre` tag
  - Removed automatic indent
- Updated dependencies

## 2021-10-05 - v3.0.7

- Contents page can be suppressed
  - New `showContents` metadata item

## 2021-10-05 - v3.0.6

- Section filename override
  - Optionally rename content files
  - Allows internal linking

## 2021-10-04 - v3.0.5

- `Genre` now optional
- Image collection now optional
  - Cover still required

## 2021-10-03 - v3.0.4

- Correct the mimetype for `.jpg` cover images
  - Thanks to bmaupin
- `npm audit` updates for transitive dependencies
  - Avoid `lodash` command injection
  - Avoid regex denials of service

## 2021-04-11 - v3.0.2

- Wait for file descriptor before returning from writeEPUB

## 2021-02-22 - v3.0.0, v3.0.1

- Included [Wallaby.js](https://wallabyjs.com/) configuration
  - Contributors can use a free OSS license (I have a paid one, it's worth supporting)
- Switched to `async`/`await` rather than callbacks
- Updated documentation
- Bumped version to update the documentation on *npm*

## 2021-02-17

- Now developed against Node v15.6.0
  - Node v10.3 or later should work fine
- Updated dependencies
  - Updated Sinon stub syntax in tests
- Moved `cover` into document metadata
  - Now supports multiple image types (`png`, `jpg`, etc)
  - Any type whose file extention fits a mimetype like `image/png` or `image/jpg`

---

## BREAKING CHANGES

---

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
