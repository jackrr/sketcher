import xs from 'xstream'
import isolate from '@cycle/isolate'
import { canvas, div } from '@cycle/dom'
import Sketch from './Sketch'

function mobile() {
  return navigator.userAgent.match(/iphone|Android/ig)
}

function browserIntent(DOM) {
  const mouseEvent$ = xs.merge(
    DOM.select('.board').events('mousedown'),
    DOM.select('.board').events('mousemove'),
    DOM.select('.board').events('mouseup')
  ).map(({ x: offsetX, y: offsetY, type }) => {
    if (type === 'mousedown') {
      type = 'S'
    } else if (type === 'mousemove') {
      type = 'P'
    } else {
      type = 'E'
    }
    return {x, y, type}
  })

  const drawing$ = mouseEvent$
    .fold((drawing, me) => {
      if (me.type === 'S') return true
      if (me.type === 'E') return false

      return drawing
    })

  const point$ = xs.combine(mouseEvent$, drawing$)
    .filter(([me, drawing]) => drawing)
    .map(([me, drawing]) => me)

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
      canvas('#board')
    )
}

export default function Board(sources) {
  const point$ = intent(sources.DOM)
  const state$ = model(sources.props)
  const vtree$ = view(state$)

  sources.points.map(s => {console.log(s)})
  state$.map(s => {console.log(s)})

  const sinks = {
    DOM: vtree$,
    points: point$,
    canvas: xs.merge(point$, sources.point$)
  }

  return sinks
}
