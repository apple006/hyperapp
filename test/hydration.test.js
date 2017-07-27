import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

//
// Naive hydration. Doesn't handle contiguous empty text nodes.
//
const hydrate = node =>
  node
    ? {
        tag: node.tagName.toLowerCase(),
        data: {},
        children: Array.prototype.map.call(
          node.childNodes,
          node => (node.nodeType === 3 ? node.nodeValue : hydrate(node))
        )
      }
    : node

beforeEach(() => {
  document.body.innerHTML = ""
})

test("hydrate from SSR", done => {
  //
  // Let's suppose this HTML was rendered on the server.
  //
  document.body.innerHTML = `<div id="foo" data-ssr>foo</div>`

  app({
    view: state => h("div", {}, "foo"),
    root: document.querySelector("[data-ssr]"),
    events: {
      load(state, actions, root) {
        return hydrate(root)
      },
      patch() {
        //
        // Without hydration root would be overwritten.
        //
        expect(document.body.innerHTML).toBe(
          `<div id="foo" data-ssr="">foo</div>`
        )
        done()
      }
    }
  })
})

test("hydrate from SSR with out-of-date text node", done => {
  document.body.innerHTML = `<div id="foo" data-ssr>foo</div>`

  app({
    view: state => h("div", {}, "bar"),
    root: document.querySelector("[data-ssr]"),
    events: {
      load(state, actions, root) {
        return hydrate(root)
      },
      patch() {
        expect(document.body.innerHTML).toBe(
          `<div id="foo" data-ssr="">bar</div>`
        )
        done()
      }
    }
  })
})
