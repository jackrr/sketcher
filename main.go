package main

import (
	"github.com/jackrr/sketcher/socket"
	"net/http"
)

func main() {
	m := board.NewManager()
	http.HandleFunc("/", m.WsHandler())
	http.HandleFunc("/reset", m.ResetHandler())

	err := http.ListenAndServe("8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
