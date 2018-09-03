package socket

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (p *ClientPool) Handler() func(w http.ResponseWriter, r *http.Request) {
	p.run()

	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}

		client := &Client{pool: p, conn: conn, send: make(chan []byte, 256)}
		client.pool.register <- client
	}
}
