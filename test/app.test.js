import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("throttling", done => {
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
        actions.up()
        actions.up()
        actions.up()
      },
      patch(state) {
        expect(state).toEqual({ value: 5 })
        //
        // Without throttling, we'd expect this event to fire for each state update.
        //
        expect(document.body.innerHTML).toBe("<div>5</div>")
        done()
      }
    }
  })
})

test("interop", done => {
  const emit = app({
    view: "",
    events: {
      foo(state, actions, data) {
        expect(data).toBe("bar")
        done()
      }
    }
  })
  emit("foo", "bar")
})
