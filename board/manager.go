package board

import (
	"github.com/jackrr/sketcher/socket"
	"net/http"
)

type Manager struct {
	ClientPool *socket.ClientPool
}

func (m *Manager) WsHandler() func(w http.ResponseWriter, r *http.Request) {
	return m.ClientPool.Handler()
}

func (m *Manager) ResetHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		m.reset()
		w.
	}
}

func NewManager() (b *Manager) {
	return &Manager{ClientPool: socket.NewClientPool()}
}
