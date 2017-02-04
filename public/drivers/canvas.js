import xs from 'xstream'

let ctx = null
let lastPoints = {}
let currentLid = null
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

function reset() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  lastPoints = {}
}

function startPath({ x, y }) {
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = "#ffffff"
  ctx.moveTo(x, y)
}

function lineTo({ x, y }) {
  if (x && y) {
    ctx.lineTo(x, y)
    ctx.stroke()
  }
}

function drawPoint(point) {
  if (point.type === 'S') {
    startPath(point)
  } else {
    if (currentLid != point.lid) {
      startPath(lastPoints[point.lid])
    }

    lineTo(point)
  }

  if (point.type === 'E') {
    delete lastPoints[point.lid]
    console.log(point, lastPoints)
  } else {
    currentLid = point.lid
    lastPoints[currentLid] = point
  }
}

function processMessage(message) {
  if (message.type == 'RESET') {
    reset()
  } else {
    drawPoint(message)
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
