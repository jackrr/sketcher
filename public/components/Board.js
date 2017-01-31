import xs from 'xstream'
import isolate from '@cycle/isolate'
import { div } from '@cycle/dom'
import Sketch from './Sketch'

function pointData(mouseEvent) {
  return {
    x: mouseEvent.offsetX,
    y: mouseEvent.offsetY,
    type: 'P'
  }
}

function mobile() {
  return navigator.userAgent.match(/iphone|Android/ig)
}

function browserIntent(DOM) {
  const mouseEvent$ = xs.merge(
    DOM.select('.board').events('mousedown'),
    DOM.select('.board').events('mousemove'),
    DOM.select('.board').events('mouseup')
  )

  const drawing$ = mouseEvent$
    .fold((drawing, me) => {
      if (me.type === 'mousedown') return true
      if (me.type === 'mouseup') return false

      return drawing
    })

  const point$ = xs.combine(mouseEvent$, drawing$)
    .filter(([me, drawing]) => drawing)
    .map(([me, drawing]) => {
      return pointData(me)
    })

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

function model(props$, point$, myPoint$) {
  return props$
    .map(props => point$
      .map(points => myPoint$
        .fold((myPoints, myPoint) => {
          myPoints.push(myPoint)
          return myPoints
        }, [])
        .map(myPoints => {
          return {
            points: points.concat(myPoints),
            name: props.name
          }
        })
      ).flatten()
    )
    .flatten()
    .remember()
}

function pointDom(p) {
  return div('.point', {style: { top: `${p.y}.px`, left: `${p.x}.px` }})
}

function view(state$) {
  return state$
    .map(state =>
      div('.board', state.points.map(p => pointDom(p)))
    )
}

export default function Board(sources) {
  const myPoint$ = intent(sources.DOM)
  const state$ = model(sources.props, sources.points, myPoint$)
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$,
    points: myPoint$
  }

  return sinks
}
