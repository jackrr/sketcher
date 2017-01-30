import xs from 'xstream'

function fakeWS() {
  return {
    send: (msg) => { console.log(`[fakeWS] ${msg}`) },
    addEventListener: (string, cb) => {
      console.log(`[fakeWS] adding event listener '${string}'`)
    },
    close: () => { console.log(`[fakeWS] closed`) }
  }
}

function getWS(url) {
  let ws

  try {
    // ws = new WebSocket(url)
    ws = fakeWS()
  } catch (err) {
    console.log("Error setting up websocket connection to server", err)
    ws = fakeWS()
  }

  return ws
}

export function makeWSDriver({ domain = 'localhost', port = 8080 }) {
  const ws = getWS(`ws://${domain}:${port}`)

  function wsDriver(outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
        console.log(`Sending ${outgoing} on websocket`)
        ws.send(outgoing)
      },
      error: () => {},
      complete: () => {}
    })

    return xs.create({
      start: listener => {
        ws.addEventListener('message', function(message) {
          listener.next(message)
        })
      },
      stop: () => {
        ws.close()
      }
    })
  }

  return wsDriver
}
