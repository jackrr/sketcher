import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import { makeCanvasDriver } from './drivers/canvas'
import Board from './components/Board'

function main(sources) {
  const point$ = sources.websocket
    .filter(message => {
      return message.type === 'P' || message.type == 'S' || message.type === 'E'
    })

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    points: point$
  }

  const board = isolate(Board)(boardSources)

  const boardDom$ = board.DOM
  const vdom$ = boardDom$.map(boardDom => div('.app',
    [
      h1('.title', 'Hello world!'),
      boardDom
    ]))

  const sinks = {
    DOM: vdom$,
    websocket: board.points,
    canvas: board.canvas
  }

  return sinks
}

run(main, {
  websocket: makeWSDriver({ domain: window.location.hostname, port: 8080 }),
  DOM: makeDOMDriver('#main'),
  canvas: makeCanvasDriver('#board')
})
