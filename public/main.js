import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import Board from './components/Board'

function main(sources) {
  const sketch$ = sources.websocket
    .filter(message => message.type === 'SKETCH')
    .map(message => message.sketch)
    .fold((sketches, sketch) => {
      sketches.push(sketch)
      return sketches
    }, [])

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    sketches: sketch$
  }

  const board = isolate(Board)(boardSources)

  const outgoing$ = board.sketches
  const boardDom$ = board.DOM

  const vdom$ = boardDom$.map(boardDom => {
    const res = div([
      h1('.title', 'Hello world!'),
      boardDom
    ])
    return res
  })

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
