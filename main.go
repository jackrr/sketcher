package main

import (
	"fmt"
	"github.com/jackrr/sketcher/board"
	"net/http"
)

func main() {
	fmt.Println("Starting...")
	m := board.NewManager()
	fmt.Println("Adding handlers...")

	wsServer := http.NewServeMux()
	wsServer.HandleFunc("/", m.WsHandler())
	wsServer.HandleFunc("/reset", m.ResetHandler())

	fmt.Println("Making next mux...")

	staticServer := http.NewServeMux()
	staticServer.Handle("/", http.FileServer(http.Dir("public")))

	go func() {
		fmt.Println("Starting websocket server on 8080")
		err := http.ListenAndServe(":8080", wsServer)
		if err != nil {
			fmt.Printf("Websocket server error: %v\n", err)
		}
	}()

	go func() {
		fmt.Println("Starting static server on 8000")
		err := http.ListenAndServe(":8000", staticServer)
		if err != nil {
			fmt.Printf("Static server error: %v\n", err)
		}
	}()

	m.Start()
}
