import xs from 'xstream'

function makeWSDriver({ domain = 'localhost', port = 8080 }) {
  const ws = new WebSocket(`ws://${domain}:${port}`)

  function wsDriver(outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
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
      }
    })
  }

  return wsDriver
}
