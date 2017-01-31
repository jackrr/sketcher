import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import { makeCanvasDriver } from './drivers/canvas'
import Board from './components/Board'

function main(sources) {
  const point$ = sources.websocket
    .filter(message => message.type === 'P')

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    points: point$
  }

  const board = isolate(Board)(boardSources)

  const boardDom$ = board.DOM
  const outgoing$ = board.points
  const canva$ = board.canvas

  const vdom$ = boardDom$.map(boardDom => div('.app',
  [
    h1('.title', 'Hello world!'),
    boardDom
  ]))

  const sinks = {
    DOM: vdom$,
    websocket: outgoing$,
    canvas: canva$
  }

  return sinks
}

run(main, {
  websocket: makeWSDriver({domain: 'localhost', port: 8080}),
  DOM: makeDOMDriver('#main'),
  canvas: makeCanvasDriver('#board')
})
