import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div, h2 } from '@cycle/dom'
import Sketch from './Sketch'

function intent(DOM) {
  return DOM.select('.board').events('mousedown')
    .map(ev => {
      console.log('click', ev)
      return { type: 'SKETCH', x: ev.offsetX, y: ev.offsetY }
     })
    .startWith({})
}

function model(props$, sketch$, action$) {
  return props$
    .map(props => sketch$
      .map(sketches => action$
        .filter(action => action.type === 'SKETCH')
        .fold((localSketches, localSketch) => {
          localSketches.push(localSketch)
          return localSketches
        }, [])
        .map(localSketches => {
          return {
            sketches: sketches.concat(localSketches),
            name: props.name
          }
        })
      ).flatten()
    )
    .flatten()
    .remember()
}

function sketchDom(sketch) {
  return div('.sketch', {style: { top: `${sketch.y}.px`, left: `${sketch.x}.px` }})
}

function view(state$) {
  return state$.map(state => {
    const sketches = state.sketches.map(sketchDom)
    return div('.board', [sketches])
  })
}

export default function Board(sources) {
  const action$ = intent(sources.DOM)
  const state$ = model(sources.props, sources.sketches, action$)
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$,
    sketches: action$.filter(action => action.type === 'SKETCH')
  }

  return sinks
}
