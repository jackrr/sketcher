import xs from 'xstream'
import isolate from '@cycle/isolate'
import { canvas } from '@cycle/dom'
import Sketch from './Sketch'

function mobile() {
  return navigator.userAgent.match(/iphone|Android/ig)
}

function whenDrawing(interaction$) {
  return interaction$
    .fold((acc, interaction) => {
      let drawing = acc.drawing
      if (interaction.type === 'S') drawing = true
      if (interaction.type === 'E') drawing = false

      return { drawing, interaction }
    }, { drawing: false, interaction: null })
    .filter(payload => payload.drawing)
    .map(payload => payload.interaction)
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

  return whenDrawing(mouseEvent$)
}

function mobileIntent(DOM) {
  const touchEvent$ = xs.merge(
    DOM.select('#board').events('touchstart'),
    DOM.select('#board').events('touchmove'),
    DOM.select('#board').events('touchend')
  ).map(({ type, touches, target }) => {
    if (type === 'touchstart') {
      type = 'S'
    } else if (type === 'touchmove') {
      type = 'P'
    } else {
      type = 'E'
    }

    let x
    let y

    if (touches.length) {
      x = touches[0].pageX - target.offsetLeft
      y = touches[0].pageY - target.offsetTop
    }

    return { type, x, y }
  })

  return whenDrawing(touchEvent$)
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
      canvas('#board', { attrs: { height: 800, width: 800 }})
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
