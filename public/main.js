import xs from 'xstream'
import isolate from '@cycle/isolate'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div, h1 } from '@cycle/dom'
import { makeWSDriver } from './drivers/websocket'
import { makeCanvasDriver } from './drivers/canvas'
import { makeHTTPDriver } from '@cycle/http'
import Board from './components/Board'
import ActionPanel from './components/ActionPanel'

function main(sources) {
  const wsEvent$ = sources.websocket
    .filter(message => {
      return message.type === 'P' ||
             message.type === 'S' ||
             message.type === 'E' ||
             message.type === 'RESET'
    })

  const userId$ = sources.websocket
    .filter(message => message.type === 'CLIENT_ID')
    .map(message => message.id)

  const boardSources = {
    DOM: sources.DOM,
    props: xs.of({ name: 'Test' }),
    HTTP: sources.HTTP
  }

  const board = isolate(Board)(boardSources)
  const actions = isolate(ActionPanel)({ DOM: sources.DOM })

  const boardDom$ = board.DOM
  const actionDom$ = actions.DOM
  const vdom$ = boardDom$
    .map(boardDom => actionDom$
      .map(actionDom =>
        div('.app', [
          h1('.title', 'sketch!'),
          boardDom,
          actionDom
        ])
      )
    ).flatten()

  // Known issue: incoming reset message
  // triggers stream re-emit of last point
  const signedPoint$ = xs.combine(board.points, userId$)
    .map(([point, userId]) => {
      return {
        ...point,
        uid: userId,
      }
    })

  const sinks = {
    DOM: vdom$,
    websocket: signedPoint$,
    canvas: xs.merge(signedPoint$, wsEvent$, actions.downloads),
    HTTP: actions.requests
  }

  return sinks
}

run(main, {
  websocket: makeWSDriver({ domain: window.location.hostname, port: 8080 }),
  DOM: makeDOMDriver('#main'),
  canvas: makeCanvasDriver('#board'),
  HTTP: makeHTTPDriver()
})
