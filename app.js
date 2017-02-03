const express = require('express')
const WebSocket = require('ws');
Error.stackTraceLimit = 100;


const app = express()
app.use(express.static('public'))

/*
*
* Board state
*
*/
let points = []

/*
*
* "secret" state reset endpoint
*
*/
app.get('/reset', (req, res) => {
  points = []
  res.status(200).send({ status: 'ok' })
})

app.listen(5000)

/*
*
* Websockets
*
*/
const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port: 8080
});

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

wss.on('connection', (ws) => {
  sendPoints(ws)

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
