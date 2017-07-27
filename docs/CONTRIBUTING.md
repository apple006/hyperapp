# Contributing to HyperApp

<!-- TOC -->

- [Code of Conduct](#code-of-conduct)
- [Core Values](#core-values)
- [Code Style](#code-style)
- [Filing Bugs](#filing-bugs)
- [Writing Tests](#writing-tests)

<!-- /TOC -->

Thank you for taking the time to read our contribution guidelines. We love to receive contributions from everyone. You can start to contribute in many ways, from writing tutorials or blog posts, improving the documentation, filing bug reports and requesting new features.

## Code of Conduct

Our open source community strives to:

* **Be friendly and patient.**
* **Be welcoming**: We strive to be a community that welcomes and supports people of **all backgrounds and identities**.
* **Be considerate**: Remember that we're a world-wide community, so you might not be communicating in someone else's primary language.
* **Be respectful**:  Not all of us will agree all the time, but disagreement is no excuse for poor behavior and poor manners. Let's be nice.
* **Be careful in the words that you choose**: We are a community of professionals, and we conduct ourselves professionally. Be kind to others. Do not insult or put down other participants. Harassment and other exclusionary behavior aren't acceptable.

This code is not exhaustive or complete. It serves to distill our common understanding of a collaborative, shared environment, and goals. We expect it to be followed in spirit as much as in the letter.

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting us at <hyperappjs@gmail.com>.

## Core Values

- [Less is more](https://en.wikipedia.org/wiki/Worse_is_better).

- [You aren't gonna need it.](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) Or we can always add it later.

- [The Elm Architecture](https://guide.elm-lang.org/architecture/).

- [Redux Three Principles](http://redux.js.org/docs/introduction/ThreePrinciples.html).

- 1 KB.

## Code Style

- Prefer descriptive single-word variable / function names to single-letter names.

- Consider improving the [Implementation Notes](/docs/implementation-notes.md) before adding comments to the code.

- Format your code before adding a commit using [prettier](https://prettier.github.io/prettier) or running the `format` script.

  ```
  npm run format
  ```

- Other than ES6 module import / exports, write in ES5.

- We prefer keeping all the moving parts inside as few files as possible. While this may change in the future, we don't intend to break the library into smaller modules.

## Filing Bugs

- Before submitting a bug report, search the issues for similar tickets. Your issue may have already been discussed or resolved. Feel free to add a comment to an existing ticket, even if it's closed.

- Determine which repository the problem should be reported in. If you have an issue with the website, you'll be better served in [hyperapp/website](https://github.com/hyperapp/website), etc.

- If you would like to share something cool you've made with HyperApp, check out [hyperapp/awesome](https://github.com/hyperapp/awesome-hyperapp).

- If you have a question or need help with something you are building, we recommend joining the [HyperApp Slack Team](https://hyperappjs.herokuapp.com).

- Be thorough in your title and report, don't leave out important details, describe your setup and include any relevant code with your issue.

- Use GitHub [fenced code blocks](https://help.github.com/articles/creating-and-highlighting-code-blocks/) to share your code. If your code has JSX in it, please use <code>```jsx</code> for accurate syntax highlighting.

## Writing Tests

- We use [Babel](https://babeljs.io) and [Jest](http://facebook.github.io/jest) to run the tests.

- Feel free to create a new `test/*.test.js` file if none of the existing test files suits your test case.

- Tests usually create an application using the [app](/docs/api.md#app) functiono and immediately check if `document.body.innerHTML` matches some expected string. The app call is async, so we often use the [patch](/docs/api.md#patch) event to detect when the view has been attached to the document.

- HyperApp uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) under the hood, but it is not natively supported by Jest. For this reason you'll often see the following code at the top of a test file:

  ```js
  window.requestAnimationFrame = setTimeout
  ```

