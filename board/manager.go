package board

import (
	"fmt"
	"github.com/jackrr/sketcher/messages"
	"github.com/jackrr/sketcher/socket"
	"net/http"
)

type Manager struct {
	ClientPool *socket.ClientPool
	draws      [][]byte
	currentID  int
}

func (m *Manager) Start() {
	m.ClientPool.Run()
}

func (m *Manager) WsHandler() func(w http.ResponseWriter, r *http.Request) {
	return m.ClientPool.Handler()
}

func (m *Manager) ResetHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		m.reset()
	}
}

func (m *Manager) OnMessage(message []byte) {
	m.draws = append(m.draws, message)
	m.ClientPool.Broadcast(message)
}

func (m *Manager) OnNewClient(c *socket.Client) {
	fmt.Println("New client")
	m.ClientPool.SendClient(c, messages.ID(m.currentID))
	m.currentID++

	for _, draw := range m.draws {
		m.ClientPool.SendClient(c, draw)
	}
}

func NewManager() (m *Manager) {
	m = &Manager{ClientPool: socket.NewClientPool()}
	m.ClientPool.SetSubscriber(m)
	return m
}

type resetMessenger struct {
	m *Manager
}

func (r *resetMessenger) GetNextMessage() []byte {
	message := messages.ID(r.m.currentID)
	r.m.currentID++
	return message
}

func (m *Manager) reset() {
	m.draws = make([][]byte, 0)
	m.ClientPool.Broadcast(messages.Reset())

	r := &resetMessenger{m: m}

	m.ClientPool.SendEachClient(r)
}
