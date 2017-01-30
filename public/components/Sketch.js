import xs from 'xstream'
import { div } from '@cycle/dom'

function model(prop$) {
  return prop$
}

function view(state$) {
  return state$.map(state => {
    console.log("making view", state)
    return div(`Sketch ${state.title}`)
  })
}

export default function Sketch(sources) {
  const state$ = model(sources.props)
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$
  }

  return sinks
}
