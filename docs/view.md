# View

Use the [view](/docs/api.md#view) to describe the user interface in your application. The view is a function called every time the state receives an update and returns a tree of [virtual nodes](/docs/virtual-nodes.md).

```jsx
app({
  state: {
    breads: ["Pita", "Naan", "Pumpernickel"]
  },
  view: state =>
    <ul>
      {state.breads.map(bread => <li>{bread}</li>)}
    </ul>
})
```

The view is passed the [actions](/docs/actions.md) object. Use it to bind actions to user events.

```jsx
app({
  state: {
    count: 0
  },
  view: (state, actions) =>
    <main>
      <h1>{state.count}</h1>
      <button onclick={actions.up}>＋</button>
    </main>
  ,
  actions: {
    up: state => ({ count: state.count + 1 })
  }
})
```
