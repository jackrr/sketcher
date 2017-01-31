import xs from 'xstream'

let ctx = null
let queue = []

function ensureCanvas(selector) {
  if (ctx) return;
  let elem = document.querySelector(selector)
  if (elem) {
    ctx = elem.getContext('2d')
    queue.map(m => processMessage(m))
    queue = []
  } else {
    console.log('delaying')
    setTimeout(assignCanvas, 10)
  }
}

function processMessage(message) {
  console.log('incoming', message)
  switch (message.type) {
    case 'ST':
      ctx.beginPath()
      ctx.moveTo(message.x, message.y)
    case 'P':
      ctx.lineTo(message.x, message.y)
      ctx.stroke()
    case 'E':
      ctx.lineTo(message.x, message.y)
      ctx.stroke()
  }
}

export function makeCanvasDriver(selector) {

  function canvasDriver(outgoing$) {
    outgoing$.addListener({
      next: message => {
        // hack to allow canvas to be in dom
        ensureCanvas(selector)

        if (ctx) {
          processMessage(message)
        } else {
          queue.push(message)
        }
      },
      error: () => {},
      complete: () => {}
    })

    return xs.empty()
  }

  return canvasDriver
}
