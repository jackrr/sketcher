package socket

type ClientPool struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	inbound chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	subscriber subscriber
}

type subscriber interface {
	OnMessage(s []byte)
	OnNewClient(c *Client)
}

type messenger interface {
	GetNextMessage() []byte
}

func NewClientPool() *ClientPool {
	return &ClientPool{
		inbound:    make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (c *ClientPool) SetSubscriber(s subscriber) {
	c.subscriber = s
}

func (c *ClientPool) Broadcast(message []byte) {
	for client := range c.clients {
		select {
		case client.send <- message:
		default:
			close(client.send)
			delete(c.clients, client)
		}
	}
}

func (c *ClientPool) SendEachClient(m messenger) {
	for client := range c.clients {
		select {
		case client.send <- m.GetNextMessage():
		default:
			close(client.send)
			delete(c.clients, client)
		}
	}
}

func (c *ClientPool) SendClient(client *Client, message []byte) {
	select {
	case client.send <- message:
	default:
		close(client.send)
		delete(c.clients, client)
	}
}

func (c *ClientPool) Run() {
	for {
		select {
		case client := <-c.register:
			c.subscriber.OnNewClient(client)
			c.clients[client] = true
		case client := <-c.unregister:
			if _, ok := c.clients[client]; ok {
				delete(c.clients, client)
				close(client.send)
			}
		case message := <-c.inbound:
			c.subscriber.OnMessage(message)
		}
	}
}
