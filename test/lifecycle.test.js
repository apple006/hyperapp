import { h, app } from "../src"

window.requestAnimationFrame = setTimeout

beforeEach(() => {
  document.body.innerHTML = ""
})

test("oncreate", done => {
  app({
    view: () =>
      h(
        "div",
        {
          oncreate(element) {
            element.className = "foo"
          }
        },
        "foo"
      ),
    events: {
      patch() {
        expect(document.body.innerHTML).toBe(`<div class="foo">foo</div>`)
        done()
      }
    }
  })
})

test("onupdate", done => {
  app({
    view: state =>
      h(
        "div",
        {
          class: state.value,
          onupdate(element, oldProps) {
            //
            // This event fires during a patch when we try to update
            // the element's data. Note that we will call this event
            // even if the element's data doesn't change.
            //
            expect(element.textContent).toBe("foo")
            expect(oldProps.class).toBe("foo")
            done()
          }
        },
        state.value
      ),
    state: { value: "foo" },
    actions: {
      repaint(state) {
        return state
      }
    },
    events: {
      patch(state, actions) {
        actions.repaint()
      }
    }
  })
})

test("onremove", done => {
  const treeA = h("ul", {}, [
    h("li"),
    h("li", {
      onremove: element => {
        //
        // Be sure to remove the element when you do use this event.
        //
        element.parentElement.removeChild(element)
      }
    })
  ])

  const treeB = h("ul", {}, [h("li")])

  app({
    view: state => (state.value ? treeA : treeB),
    state: {
      value: true
    },
    actions: {
      toggle(state) {
        return {
          value: !state.value
        }
      }
    },
    events: {
      patch(state, actions) {
        if (state.value) {
          expect(document.body.innerHTML).toBe("<ul><li></li><li></li></ul>")
          actions.toggle()
        } else {
          expect(document.body.innerHTML).toBe("<ul><li></li></ul>")
          done()
        }
      }
    }
  })
})
