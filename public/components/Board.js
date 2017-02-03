import xs from 'xstream'
import isolate from '@cycle/isolate'
import { canvas } from '@cycle/dom'
import Sketch from './Sketch'

function mobile() {
  return navigator.userAgent.match(/iphone|Android/ig)
}

function browserIntent(DOM) {
  const mouseEvent$ = xs.merge(
    DOM.select('#board').events('mousedown'),
    DOM.select('#board').events('mousemove'),
    DOM.select('#board').events('mouseup')
  ).map(({ offsetX: x, offsetY: y, type }) => {
    if (type === 'mousedown') {
      type = 'S'
    } else if (type === 'mousemove') {
      type = 'P'
    } else {
      type = 'E'
    }
    return {x, y, type}
  })

  const point$ = mouseEvent$
    .fold((acc, me) => {
      let drawing = acc.drawing
      if (me.type === 'S') drawing = true
      if (me.type === 'E') drawing = false

      return { drawing, me }
    }, { drawing: false, me: null })
    .filter(payload => payload.drawing)
    .map(payload => payload.me)

  return point$
}

function mobileIntent(DOM) {
  return xs.never()
}

function intent(DOM) {
  if (mobile()) {
    return mobileIntent(DOM)
  }

  return browserIntent(DOM)
}

function model(props$) {
  return props$
    .map(props => {
      return { name: props.name }
    }).remember()
}

function view(state$) {
  return state$
    .map(state =>
      canvas('#board', { attrs: { height: 1000, width: 1000 }})
    )
}

export default function Board(sources) {
  const point$ = intent(sources.DOM)
  const state$ = model(sources.props)
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$,
    points: point$,
    canvas: xs.merge(point$, sources.points)
  }

  return sinks
}
