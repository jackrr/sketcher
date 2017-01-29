console.log('main start')

import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import Board from './components/Board'

console.log('main start')

function main(sources) {
  const incoming$ = sources.websocket
  const sketch$ = incoming$
    .filter(message => message.type === 'SKETCH')
    .fold((sketches, sketch) => sketches.push(sketch), [])

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    sketches: sketch$
  }

  const board = isolate(Board)(boardSources)
  const outgoing$ = board.sketch
  const boardDom$ = board.DOM
  const vdom$ = boardDom$.map(boardDom =>
    div([
      h1('Hello world!'),
      boardDom
    ])
  )

  return {
    websocket: outgoing$,
    DOM: vdom$
  }
}

console.log("before run")

run(main, {
  websocket: makeWSDriver({domain: 'localhost', port: 8080}),
  DOM: makeDOMDriver('#main')
})
