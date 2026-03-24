import { create } from 'zustand'

// const host = "https://tradingservice-api.harrisowe.me"
const host = "http://localhost:8080"

// const webSocketHost = "wss://tradingservice-api.harrisowe.me/ws"
const webSocketHost = "ws://localhost:8080/ws"


const useStockStore = create((set, get) => ({
  currentUserId: 1,
  user: {},
  webSocket: null,
  currentAlogrithim: "randomWalk",
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
  setNewUserId: async (new_id) => {
    set({currentUserId: new_id})
  },
  getCurrentStrategy: async () => {
    const response = await fetch(`${host}/strategy`);
    if (!response.ok) {
      console.error("Error fetching current strat")
    }
    const result = await response.text();
    set({currentAlogrithim: result})
    return result;
  },
  setStrategy: async (strat) => {
    const response = await fetch(`${host}/strategy/${strat}`, {
      method: "POST"
    });
    if (!response.ok || !(await response.json())) {
      console.error("Error setting strategy");
    }
  },
  submitNotificationPreferences: async (preferences) => {
    const user_id = get().user.id;
    if (!user_id) return;
    console.log(user_id)
    const response = await fetch(`${host}/user/${user_id}/setNoficationPreferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      console.error("error setting notification preferences")
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
    const response = await fetch(`${host}/user/${get().currentUserId}`, {
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