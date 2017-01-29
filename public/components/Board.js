import { div, h2 } from '@cycle/dom'
import Sketch from './Sketch'

function intent(DOM) {
  // no op (for now)
  return xs.never()
}

function model(prop$, sketch$) {
  return prop$
    .map(props => sketch$
      .map(sketches => {
        return {
          sketches,
          name: props.name
        }
      })
    )
    .flatten()
    .remember()
}

function view(state$, makeSketch) {
  return state$.map(state =>
    div([
      h2(`${state.name} Board`),
      div(state.sketches.map(makeSketch))
    ])
  )
}

function makeSketchMaker(DOM) {
  return function(sketch) {
    return isolate(Sketch)({
      DOM: DOM,
      props: xs.of({ sketch })
    }).DOM
  }
}

export default function Board(sources) {
  const action$ = intent(sources.DOM)
  const state$ = model(sources.props, sources.sketches)
  const vdom$ = view(state$, makeSketchMaker(sources.DOM))

  const sinks = {
    DOM: vdom$,
    sketch: action$.filter(action => action.type === 'SKETCH')
  }

  return sinks
}
