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
    setTimeout(assignCanvas, 10)
  }
}

function processMessage(message) {
  // console.log(message, message.type)
  switch (message.type) {
    case 'S':
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#ffffff"
      ctx.moveTo(message.x, message.y)
      break;
    case 'P':
      ctx.lineTo(message.x, message.y)
      ctx.stroke()
      break;
    case 'E':
      if (message.x && message.y) {
        ctx.lineTo(message.x, message.y)
        ctx.stroke()
      }
      break;
    case 'RESET':
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      break;
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
