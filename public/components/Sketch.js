import { div } from '@cycle/dom'

function intent(DOM) {
  return xs.never()
}

function model(prop$) {
  return prop$.map(props => props.sketch)
}

function view(state$) {
  return state$.map(state =>
    div(`Sketch ${state.title}`)
  )
}

export default function Sketch(sources) {
  const action$ = intent(sources.DOM)
  const state$ = model(sources.props)
  const vdom$ = view(state$)

  const sinks = {
    DOM: vdom$
  }

  return sinks
}
