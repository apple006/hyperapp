import { h, app } from "../src"

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 50))

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("namespacing", done => {
  app({
    view: state => "",
    actions: {
      foo: {
        bar: {
          baz(state, actions, data) {
            expect(data).toBe("foo.bar.baz")
            done()
          }
        }
      }
    },
    events: {
      load(state, actions) {
        actions.foo.bar.baz("foo.bar.baz")
      }
    }
  })
})

test("sync updates", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: 1
    },
    actions: {
      up(state) {
        return {
          value: state.value + 1
        }
      }
    },
    events: {
      load(state, actions) {
        actions.up()
      },
      patch() {
        expect(document.body.innerHTML).toBe(`<div>2</div>`)
        //
        // actions.up() was a sync update, but rendering is async.
        //
        done()
      }
    }
  })
})

test("async updates", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: 2
    },
    actions: {
      up(state, actions, byNumber) {
        return {
          value: state.value + byNumber
        }
      },
      upAsync(state, actions, byNumber) {
        mockDelay().then(() => {
          actions.up(byNumber)
        })
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      },
      patch(state) {
        //
        // Ignore the first patch after the initial render.
        //
        if (state.value > 2) {
          expect(document.body.innerHTML).toBe(`<div>3</div>`)
          done()
        }
      }
    }
  })
})

test("thunks", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: 3
    },
    actions: {
      upAsync(state, actions, data) {
        return update => {
          mockDelay().then(() => {
            update({ value: state.value + data })
          })
        }
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      },
      patch(state) {
        if (state.value > 3) {
          expect(document.body.innerHTML).toBe(`<div>4</div>`)
          done()
        }
      }
    }
  })
})

test("thunks + promises", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: 4
    },
    actions: {
      upAsync(state, actions, data) {
        return mockDelay().then(() => ({
          value: state.value + data
        }))
      }
    },
    events: {
      load(state, actions) {
        actions.upAsync(1)
      },
      resolve(state, actions, result) {
        return result && typeof result.then === "function"
          ? update => result.then(update)
          : result
      },
      patch(state) {
        if (state.value > 4) {
          expect(document.body.innerHTML).toBe(`<div>5</div>`)
          done()
        }
      }
    }
  })
})
