import xs from 'xstream'
import isolate from '@cycle/isolate'
import { canvas, div, a } from '@cycle/dom'
import Sketch from './Sketch'

function mobile() {
  return navigator.userAgent.match(/iphone|Android/ig)
}

function asLinePoints(interaction$) {
  return interaction$
    .fold((acc, interaction) => {
      let drawing = acc.drawing
      let line = acc.line
      if (interaction.type === 'S') {
        drawing = true
        line++
      }

      if (interaction.type === 'E') {
        drawing = false
      }
      const keep = drawing || interaction.type === 'E'

      return { drawing, interaction, line, keep }
    }, { drawing: false, interaction: null, line: 0, keep: false })
    .filter(payload => payload.keep)
    .map(payload => {
      return {
        ...payload.interaction,
        lid: payload.line
      }
    })
}

function browserIntent(DOM) {
  const mouseEvent$ = xs.merge(
    DOM.select('#board').events('mousedown'),
    DOM.select('#board').events('mousemove'),
    DOM.select('#board').events('mouseup'),
    DOM.select('#board').events('mouseleave')
  ).map(({ offsetX: x, offsetY: y, type }) => {
    if (type === 'mousedown') {
      type = 'S'
    } else if (type === 'mousemove') {
      type = 'P'
    } else if (type === 'mouseleave') {
      type = 'E'
    } else {
      type = 'E'
    }
    return {x, y, type}
  })

  return asLinePoints(mouseEvent$)
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

  return asLinePoints(touchEvent$)
}

function intent(DOM) {
  const point$ = mobile() ? mobileIntent(DOM) : browserIntent(DOM)
  const request$ = DOM.select('a.reset').events('click')
    .map(e => {
      return {
        url: '/reset',
        method: 'GET',
        category: 'reset'
      }
    })

  return { point$, request$ }
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
      div('.board-area', [
        canvas('#board', { attrs: { height: 800, width: 800 }}),
        a('.reset', '(reset)')
      ])
    )
}

export default function Board(sources) {
  const { point$, request$ } = intent(sources.DOM)
  const state$ = model(sources.props)
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$,
    points: point$,
    requests: request$
  }

  return sinks
}
