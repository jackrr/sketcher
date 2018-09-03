package messages

import (
	"encoding/json"
)

type Message struct {
	Type    string `json:"type"`
	ID      int    `json:"id"`
	Message string `json:"message"`
}

var (
	reset = Message{Type: "reset"}
)

func Reset() []byte {
	msg, _ := json.Marshal(reset)
	return msg
}

func ID(id int) []byte {
	msg, _ := json.Marshal(Message{Type: "CLIENT_ID", ID: id})
	return msg
}
