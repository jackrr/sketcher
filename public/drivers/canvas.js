import xs from 'xstream'

let ctx = null
let lastPoints = {}
let currentLineId = null
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

function traceTo({ x, y }) {
  if (x && y) {
    ctx.lineTo(x, y)
    ctx.stroke()
  }
}

function lineId(point) {
  return `${point.uid}-${point.lid}`
}

function drawPoint(point) {
  const lid = lineId(point)

  if (point.type === 'E') {
    return delete lastPoints[lid]
  }

  if (point.type === 'S') {
    startPath(point)
  } else {
    startPath(lastPoints[lid])
    traceTo(point)
  }

  currentLineId = lid
  lastPoints[currentLineId] = point
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
