import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("attach to document.body by default", done => {
  app({
    view: state => h("div", {}, "foo"),
    events: {
      patch() {
        expect(document.body.innerHTML).toBe("<div>foo</div>")
        done()
      }
    }
  })
})

test("replace document.body if given as root", done => {
  app({
    root: document.body,
    view: state => h("body", { id: "foo" }, [h("main", {}, "foo")]),
    events: {
      patch() {
        expect(document.body.id).toBe("foo")
        expect(document.body.innerHTML).toBe("<main>foo</main>")
        done()
      }
    }
  })
})

test("replace root", done => {
  document.body.innerHTML = "<main></main>"

  app({
    root: document.body.firstChild,
    view: state => h("div", {}, "foo"),
    events: {
      patch() {
        expect(document.body.innerHTML).toBe("<div>foo</div>")
        done()
      }
    }
  })
})

test("replace nested root", done => {
  document.body.innerHTML = "<section><main></main></section>"

  app({
    root: document.body.firstChild.firstChild,
    view: state => h("div", {}, "foo"),
    events: {
      patch() {
        expect(document.body.innerHTML).toBe(
          "<section><div>foo</div></section>"
        )
        done()
      }
    }
  })
})

test("non-empty root", done => {
  document.body.innerHTML = "<section><main></main><div></div></section>"

  app({
    root: document.body.firstChild.lastChild,
    view: state => h("div", {}, "foo"),
    events: {
      patch() {
        expect(document.body.innerHTML).toBe(
          `<section><main></main><div>foo</div></section>`
        )
        done()
      }
    }
  })
})

test("mutated root", done => {
  document.body.innerHTML = "<main><div></div></main>"

  const host = document.body.firstChild
  const root = host.firstChild

  app({
    root,
    view: state => h("div", {}, state.value),
    state: {
      value: "foo"
    },
    actions: {
      bar(state) {
        return {
          value: "bar"
        }
      }
    },
    events: {
      patch(state, actions) {
        if (state.value === "bar") {
          //
          // Ignore the second patch after actions.bar().
          //
          return done()
        }

        expect(document.body.innerHTML).toBe(`<main><div>foo</div></main>`)
        //
        // We should be able to correctly patch from the root even if the
        // element that contains our top-level element (host) is changed.
        //
        host.insertBefore(document.createElement("header"), host.firstChild)
        host.appendChild(document.createElement("footer"))

        actions.bar()

        expect(document.body.innerHTML).toBe(
          `<main><header></header><div>bar</div><footer></footer></main>`
        )
      }
    }
  })
})
