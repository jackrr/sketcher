import xs from 'xstream'

// WebSocket readyState constants:
const CONNECTING = 0 // The connection is not yet open.
const OPEN       = 1 // The connection is open and ready to communicate.
const CLOSING    = 2 // The connection is in the process of closing.
const CLOSED     = 3 // The connection is closed or couldn't be opened.

function fakeWS() {
  return {
    send: (msg) => { console.log(`[fakeWS] ${msg}`) },
    addEventListener: (string, cb) => {
      console.log(`[fakeWS] adding event listener '${string}'`)
    },
    close: () => { console.log(`[fakeWS] closed`) }
  }
}

export function makeWSDriver({ domain = 'localhost', port = 8080 }) {
  const ws = new WebSocket(`ws://${domain}:${port}`)
  let queue = []

  function send(message) {
    ws.send(JSON.stringify(message))
  }

  function flushQueue() {
    queue.map(outgoing => {
      send(outgoing)
    })
    queue = []
  }

  function wsDriver(outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
        if (ws.readyState === OPEN) {
          send(outgoing)
        } else {
          queue.push(outgoing)
        }
      },
      error: () => {},
      complete: () => {}
    })

    return xs.create({
      start: listener => {
        ws.addEventListener('open', ev => {
          flushQueue()
          ws.addEventListener('message', incoming => {
            listener.next(JSON.parse(incoming.data))
          })
        })
      },
      stop: () => {
        ws.close()
      }
    })
  }

  return wsDriver
}
