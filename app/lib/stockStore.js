import { create } from 'zustand'

const host = "http://localhost:8080"
const webSocketHost = "ws://localhost:8080/ws"

const useStockStore = create((set, get) => ({
  user: {},
  webSocket: null,
  webSocketMessageHandler: (event) => {    
    try {
      const json = JSON.parse(event.data)
      set({stocks: json})
      console.log(json)
    } catch (error) {
      console.error(error)
    }
  },
  establishWebSocket: () => {
    const socket = new WebSocket(webSocketHost);
    socket.addEventListener("open", (event) => {
      socket.send("1");
    });
    
    socket.addEventListener("message", get().webSocketMessageHandler)
    set({webSocket: socket})
  },
  stocks: [],
  pendingTrades: [],
  trades: [],
  fetchStocks: async () => {
    const response = await fetch(`${host}/stock`)
    if (!response.ok) {
      console.error("Error fetching stocks")
    } else {
      const stocks = await response.json();
      console.log(stocks);
      set({ stocks });
    }
  },
  fetchTrades: async () => {
    const response = await fetch(`${host}/trades?userId=${get().user.id}`)
    if (!response.ok) {
      console.error("Error fetching trades")
    } else {
      const trades = await response.json();
      console.log(trades);
      set({ trades });
    }
  },
  fetchPendingTrades: async () => {
    const response = await fetch(`${host}/trades/pending?userId=${get().user.id}`)
    if (!response.ok) {
      console.error("Error fetching pending trades")
    } else {
      const trades = await response.json();
      console.log(trades);
      set({ pendingTrades: trades });
    }
  },
  queueTrade: async (tradeRequest) => {
    
  },
  fetchUser: async () => {
    const response = await fetch(`${host}/user/1`, {
      METHOD: "POST"
    });
    if (!response.ok) {
      console.error("failed to fetch user")
    } else {
      const user = await response.json();
      console.log(user)
      set({ user: user });
    }
  }
}))

export default useStockStore;