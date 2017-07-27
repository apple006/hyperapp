import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("extend the state", done => {
  app({
    view: state => "",
    state: {
      foo: true
    },
    events: {
      load: state => {
        expect(state).toEqual({
          foo: true,
          bar: true
        })
        done()
      }
    },
    mixins: [
      () => ({
        state: {
          bar: true
        }
      })
    ]
  })
})

test("extend events", done => {
  app({
    view: state => "",
    state: {
      value: 0
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
        expect(state.value).toBe(0)
        actions.up()
      }
    },
    mixins: [
      () => ({
        events: {
          load(state, actions) {
            expect(state.value).toBe(1)
            actions.up()
          }
        }
      }),
      () => ({
        events: {
          load(state) {
            expect(state.value).toBe(2)
            done()
          }
        }
      })
    ]
  })
})

test("extend actions", done => {
  app({
    view: state => h("div", {}, state.value),
    state: {
      value: ""
    },
    events: {
      load(state, actions) {
        actions.foo()
      },
      patch() {
        expect(document.body.innerHTML).toBe(`<div>foo</div>`)
        done()
      }
    },
    mixins: [
      () => ({
        actions: {
          foo() {
            return {
              value: "foo"
            }
          }
        }
      })
    ]
  })
})

test("extend namespace", done => {
  app({
    view: () => "",
    actions: {
      foo: {
        bar(state, actions, data) {
          expect(data).toBe(true)
        }
      }
    },
    events: {
      load(state, actions) {
        actions.foo.bar(true)
        actions.foo.baz(true)
        actions.foo.quux.ping(true)
        done()
      }
    },
    mixins: [
      () => ({
        actions: {
          foo: {
            baz(state, actions, data) {
              expect(data).toBe(true)
            },
            quux: {
              ping(state, actions, data) {
                expect(data).toBe(true)
              }
            }
          }
        }
      })
    ]
  })
})

test("presets", () => {
  const foobar = () => ({
    //
    // Presets are mixins that can group other mixins.
    //
    mixins: [
      () => ({
        state: {
          foo: 1
        }
      }),
      () => ({
        state: {
          bar: 2
        }
      })
    ]
  })

  app({
    view: () => "",
    events: {
      load(state) {
        expect(state.foo).toBe(1)
        expect(state.bar).toBe(2)
      }
    },
    mixins: [foobar]
  })
})

test("receive emit function", done => {
  app({
    view: () => "",
    events: {
      foo() {
        done()
      }
    },
    mixins: [
      emit => ({
        events: {
          load() {
            emit("foo")
          }
        }
      })
    ]
  })
})
