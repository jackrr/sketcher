import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import Board from './components/Board'

function main(sources) {
  const point$ = sources.websocket
    .filter(message => message.type === 'POINT')
    .fold((points, point) => {
      points.push(point)
      return points
    }, [])

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    points: point$
  }

  const board = isolate(Board)(boardSources)

  const outgoing$ = board.points
  const boardDom$ = board.DOM

  const vdom$ = boardDom$.map(boardDom => div('.app',
  [
    h1('.title', 'Hello world!'),
    boardDom
  ]))

  const sinks = {
    DOM: vdom$,
    websocket: outgoing$
  }

  return sinks
}

run(main, {
  websocket: makeWSDriver({domain: 'localhost', port: 8080}),
  DOM: makeDOMDriver('#main')
})
