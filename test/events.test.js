import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("load", done => {
  app({
    view: state => "",
    state: {
      value: "foo"
    },
    actions: {
      set(state, actions, value) {
        return { value }
      }
    },
    events: {
      load(state, actions) {
        actions.set("bar")
      },
      update(state, actions, nextState) {
        expect(state.value).toBe("foo")
        expect(nextState.value).toBe("bar")
        done()
      }
    }
  })
})

test("render", done => {
  app({
    state: {
      value: "foo"
    },
    view: state => h("div", {}, state.value),
    events: {
      render(state, actions, view) {
        return state => h("main", {}, view(state, actions))
      },
      patch() {
        expect(document.body.innerHTML).toBe(`<main><div>foo</div></main>`)
        done()
      }
    }
  })
})

test("action", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: "foo"
    },
    actions: {
      set(state, actions, value) {
        return { value }
      }
    },
    events: {
      load(state, actions) {
        actions.set("bar")
      },
      patch(state) {
        expect(state).toEqual({ value: "bar" })
        expect(document.body.innerHTML).toBe(`<div>bar</div>`)
        done()
      },
      action(state, actions, { name, data }) {
        expect(name).toBe("set")
        expect(data).toBe("bar")
      }
    }
  })
})

test("resolve", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: "foo"
    },
    actions: {
      set(state, actions, data) {
        return `?value=bar`
      }
    },
    events: {
      load(state, actions) {
        actions.set("bar")
      },
      patch(state) {
        expect(state).toEqual({ value: "bar" })
        expect(document.body.innerHTML).toBe(`<div>bar</div>`)
        done()
      },
      resolve(state, actions, result) {
        if (typeof result === "string") {
          //
          // Support for query strings as a valid action result type.
          //
          const [key, value] = result.slice(1).split("=")
          return {
            [key]: value
          }
        }
      }
    }
  })
})

test("update", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: "foo"
    },
    actions: {
      set(state, actions, value) {
        return { value }
      }
    },
    events: {
      load(state, actions) {
        actions.set(null)
      },
      patch(state) {
        expect(state).toEqual({ value: "foo" })
        expect(document.body.innerHTML).toBe(`<div>foo</div>`)
        done()
      },
      update(state, actions, nextState) {
        //
        // We can use update to validate state changes.
        //
        if (typeof nextState.value !== "string") return state
      }
    }
  })
})

test("patch", done => {
  app({
    view: state => h("div", {}, "foo"),
    events: {
      patch(state, actions, root) {
        //
        // This event fires after the view is rendered and attached
        // to the DOM with your app top-level element / root.
        //
        root.appendChild(document.createTextNode("bar"))
        expect(document.body.innerHTML).toBe(`<div>foobar</div>`)
        done()
      }
    }
  })
})
