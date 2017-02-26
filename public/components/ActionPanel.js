import xs from 'xstream'
import { div, a, i } from '@cycle/dom'

function intent(DOM) {
  const download$ = DOM.select('a.download').events('click')
    .map(e => {
      return {type: 'DOWNLOAD'}
    })
  const request$ = DOM.select('a.reset').events('click')
    .map(e => {
      return {
        url: '/reset',
        method: 'GET',
        category: 'reset'
      }
    })

  return { request$, download$ }
}

function model() {
  return xs.of({}).remember()
}

function view(state$) {
  return state$.map(state =>
    div('.actions', [
      a('.reset', [
        i('.material-icons', 'delete_forever')
      ]),
      a('.download', [
        i('.material-icons', 'file_download')
      ])
    ])
  )
}

export default function ActionPanel(sources) {
  const { request$, download$ } = intent(sources.DOM)
  const state$ = model()
  const vtree$ = view(state$)

  const sinks = {
    DOM: vtree$,
    requests: request$,
    downloads: download$
  }

  return sinks
}
