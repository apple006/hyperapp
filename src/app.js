export function app(props) {
  var state
  var actions = {}
  var events = {}
  var mixins = []
  var view = props.view
  var node
  var root = props.root
  var host = (root && root.parentNode) || document.body
  var lock = false

  for (var i = -1; i < mixins.length; i++) {
    props = mixins[i] ? mixins[i](emit) : props

    Object.keys(props.events || []).map(function(key) {
      events[key] = (events[key] || []).concat(props.events[key])
    })

    iterate(actions, props.actions)

    mixins = mixins.concat(props.mixins || [])
    state = merge(state, props.state)
  }

  schedule((node = emit("load", root)))

  return emit

  function update(withState) {
    if (withState) {
      schedule((state = emit("update", merge(state, withState))))
    }
  }

  function schedule() {
    if (view && !lock) {
      requestAnimationFrame(render, (lock = !lock))
    }
  }

  function render() {
    emit(
      "patch",
      (root = patch(
        host,
        root,
        node,
        (node = emit("render", view)(state, actions))
      )),
      (lock = !lock)
    )
  }

  function iterate(namespace, children, lastName) {
    Object.keys(children || []).map(function(key) {
      var action = children[key]
      var name = lastName ? lastName + "." + key : key

      if (typeof action === "function") {
        namespace[key] = function(data) {
          emit("action", { name: name, data: data })

          var result = emit("resolve", action(state, actions, data))

          return typeof result === "function" ? result(update) : update(result)
        }
      } else {
        iterate(namespace[key] || (namespace[key] = {}), action, name)
      }
    })
  }

  function emit(name, data) {
    return (events[name] || []).map(function(cb) {
      var result = cb(state, actions, data)
      if (result != null) {
        data = result
      }
    }), data
  }

  function merge(a, b) {
    var obj = {}

    for (var i in a) {
      obj[i] = a[i]
    }

    for (var i in b) {
      obj[i] = b[i]
    }

    return obj
  }

  function getKey(node) {
    if (node && (node = node.data)) {
      return node.key
    }
  }

  function createElement(node, isSVG) {
    if (typeof node === "string") {
      var element = document.createTextNode(node)
    } else {
      var element = (isSVG = isSVG || node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag)

      for (var i = 0; i < node.children.length; ) {
        element.appendChild(createElement(node.children[i++], isSVG))
      }

      for (var i in node.data) {
        if (i === "oncreate") {
          node.data[i](element)
        } else {
          setElementData(element, i, node.data[i])
        }
      }
    }

    return element
  }

  function setElementData(element, name, value, oldValue) {
    if (
      name === "key" ||
      name === "oncreate" ||
      name === "onupdate" ||
      name === "onremove"
    ) {
    } else if (name === "style") {
      for (var i in merge(oldValue, (value = value || {}))) {
        element.style[i] = value[i] || ""
      }
    } else {
      try {
        element[name] = value
      } catch (_) {}

      if (typeof value !== "function") {
        if (value) {
          element.setAttribute(name, value)
        } else {
          element.removeAttribute(name)
        }
      }
    }
  }

  function updateElementData(element, oldData, data) {
    for (var name in merge(oldData, data)) {
      var value = data[name]
      var oldValue = oldData[name]

      if (value !== oldValue && value !== element[name]) {
        setElementData(element, name, value, oldValue)
      }
    }

    if (data && data.onupdate) {
      data.onupdate(element, oldData)
    }
  }

  function removeElement(parent, element, data) {
    if (data && data.onremove) {
      data.onremove(element)
    } else {
      parent.removeChild(element)
    }
  }

  function patch(parent, element, oldNode, node, isSVG, lastElement) {
    if (oldNode == null) {
      element = parent.insertBefore(createElement(node, isSVG), element)
    } else if (node.tag != null && node.tag === oldNode.tag) {
      updateElementData(element, oldNode.data, node.data)

      isSVG = isSVG || node.tag === "svg"

      var len = node.children.length
      var oldLen = oldNode.children.length
      var reusableChildren = {}
      var oldElements = []
      var newKeys = {}

      for (var i = 0; i < oldLen; i++) {
        var oldElement = element.childNodes[i]
        oldElements[i] = oldElement

        var oldChild = oldNode.children[i]
        var oldKey = getKey(oldChild)

        if (null != oldKey) {
          reusableChildren[oldKey] = [oldElement, oldChild]
        }
      }

      var i = 0
      var j = 0

      while (j < len) {
        var oldElement = oldElements[i]
        var oldChild = oldNode.children[i]
        var newChild = node.children[j]

        var oldKey = getKey(oldChild)
        if (newKeys[oldKey]) {
          i++
          continue
        }

        var newKey = getKey(newChild)

        var reusableChild = reusableChildren[newKey] || []

        if (null == newKey) {
          if (null == oldKey) {
            patch(element, oldElement, oldChild, newChild, isSVG)
            j++
          }
          i++
        } else {
          if (oldKey === newKey) {
            patch(element, reusableChild[0], reusableChild[1], newChild, isSVG)
            i++
          } else if (reusableChild[0]) {
            element.insertBefore(reusableChild[0], oldElement)
            patch(element, reusableChild[0], reusableChild[1], newChild, isSVG)
          } else {
            patch(element, oldElement, null, newChild, isSVG)
          }

          j++
          newKeys[newKey] = newChild
        }
      }

      while (i < oldLen) {
        var oldChild = oldNode.children[i]
        var oldKey = getKey(oldChild)
        if (null == oldKey) {
          removeElement(element, oldElements[i], oldChild.data)
        }
        i++
      }

      for (var i in reusableChildren) {
        var reusableChild = reusableChildren[i]
        var reusableNode = reusableChild[1]
        if (!newKeys[reusableNode.data.key]) {
          removeElement(element, reusableChild[0], reusableNode.data)
        }
      }
    } else if ((lastElement = element) != null && node !== element.nodeValue) {
      parent.replaceChild((element = createElement(node, isSVG)), lastElement)
    }

    return element
  }
}
