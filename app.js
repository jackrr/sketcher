const express = require('express')
const WebSocket = require('ws');
const PRODUCTION = process.env.NODE_ENV === 'production'

Error.stackTraceLimit = 100;

const app = express()
const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port: PRODUCTION ? 8000 : 8080
});

/*
*
* Board state
*
*/
let points = []
let currentId = 0

function nextId() {
  return currentId++
}

function saveMessage(message) {
  points.push(message)
  // points.push(JSON.parse(message))
}

function sendPoints(client) {
  points.map((p) => {
    client.send(p)
    // client.send(JSON.stringify(p))
  })
}

function resetBoard() {
  console.log('Resetting')
  points = []

  wss.clients.forEach(client => {
    client.send(JSON.stringify({ type: 'RESET' }))
  })
}

/*
*
* Websockets
*
*/
wss.on('connection', (ws) => {
  sendPoints(ws)
  ws.send(JSON.stringify({ type: 'CLIENT_ID', id: nextId() }))

  ws.on('message', (message) => {
    saveMessage(message)
    // broadcast to others
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })
});

/*
*
* "secret" state reset endpoint
*
*/
app.use(express.static('public'))

app.get('/reset', (req, res) => {
  resetBoard()
  res.status(200).send({ status: 'ok' })
})

app.listen(5000)
