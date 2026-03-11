import { create } from 'zustand'

const host = "https://tradingservice-api.harrisowe.me"
const webSocketHost = "wss://tradingservice-api.harrisowe.me/ws"

const useStockStore = create((set, get) => ({
  user: {},
  webSocket: null,
  webSocketMessageHandler: (event) => {    
    try {
      const json = JSON.parse(event.data)
      console.log(json)
      if (json.tag == "stocks") {
        set({stocks: json.content})
      } else if (json.tag == "notification") {
        set({notification: json.content})
      }
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
    const response = await fetch(`${host}/trades?userId=${get().user.id ?? 1}`)
    if (!response.ok) {
      console.error("Error fetching trades")
    } else {
      const trades = await response.json();
      console.log(trades);
      set({ trades });
    }
  },
  fetchPendingTrades: async () => {
    const response = await fetch(`${host}/trades/pending?userId=${get().user.id ?? 1}`)
    if (!response.ok) {
      console.error("Error fetching pending trades")
    } else {
      const trades = await response.json();
      console.log(trades);
      set({ pendingTrades: trades });
    }
  },
  queueTrade: async (tradeRequest) => {
    tradeRequest["userId"] = get().user.id;
    const response = await fetch(`${host}/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tradeRequest)
    });
    if (!response.ok) {
      console.error("Error submitting stock request")
      return false;
    } else {
      const json = await response.json();
      return json;
    }
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
  },
  notification: null,
  clearNotification: () => {
    set({notification: null})
  }
}))

export default useStockStore;