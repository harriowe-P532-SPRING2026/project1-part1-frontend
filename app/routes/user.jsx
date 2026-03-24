import { useEffect, useState } from "react"
import { DataTable } from "../components/DataTable"
import useStockStore from "../lib/stockStore"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"

const possibleNotificationPreferences = ["dashboard", "sms", "email", "console"]
const users = [
  {id: 1, name: "Trader 1"},
  {id: 2, name: "Trader 2"},
  {id: 3, name: "Trader 3"},
]

const columnDef = [
    {
      accessorKey: "type",
      header: "Ticker",
    },
    {
      accessorKey: "amount",
      header: "Quantity",
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price Purchased</div>,
      cell: ({row}) => {
        const amount = parseFloat(row.getValue("price") / 100)
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      }
    },
    {
      id: "action",
      meta: { style: { width: '1px' } },
      cell: ({row }) => {
        return (
          <Button variant="outline" className="h-8 p-2">
            <Link to={`/order/${row.getValue("type")}`}>
              Place Order
            </Link>
          </Button>
        )
      }
    }
    
  ]

  const pendingColumnDef = [
    {
      id: "type",
      header: "Ticker",
      cell: ({row}) => {
        return <div className="text-left font-medium">{row.original.stock.type}</div>
      },
    },
    {
      accessorKey: "shares",
      header: "Quantity",
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({row}) => {
        const amount = parseFloat(row.original.price / 100)
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      }
    },    
  ]


export default function User() {
    const user = useStockStore(state => state.user)
    const setNewUserId = useStockStore(state => state.setNewUserId)
    const stocks = useStockStore(state => state.stocks || [])
    const fetchUser = useStockStore(state => state.fetchUser)
    const pendingTrades = useStockStore(state => state.pendingTrades || [])
    const fetchPendingTrades = useStockStore(state => state.fetchPendingTrades)
    const [notificationPrefs, setNotificationPrefs] = useState(user?.notificationPreferences ?? []);
    const submitNotificationPreferences = useStockStore(state => state.submitNotificationPreferences)
    const [selectedUser, setSelectedUser] = useState("Trader 1")

    const notificationPrefsKey = JSON.stringify(user?.notificationPreferences);
    useEffect(() => {
      if (user?.notificationPreferences) {
        setNotificationPrefs(user.notificationPreferences);
      }
    }, [notificationPrefsKey]);

    async function refreshLists() {
      fetchUser()
      fetchPendingTrades()
    }

    useEffect(() => {
      fetchUser()
      fetchPendingTrades()

      setInterval(refreshLists, 5000);
    }, [])

    useEffect(() => {
      if (notificationPrefs != user.notificationPreferences && user != null) {
        console.log("Submitting new notification preferences")
        submitNotificationPreferences(notificationPrefs)
      }
    }, [notificationPrefs])

    useEffect(() => {
      async function handleNewUser() {
        const newUserId = users.find(u => u.name == selectedUser).id;
        await setNewUserId(newUserId);
        await refreshLists();
      }
      handleNewUser()
    }, [selectedUser])


    if (!user?.notificationPreferences) {
      return "Loading"
    }
    let totalValue = 0;
    if (user?.stocks && stocks) {
      totalValue = user.stocks.reduce((acc, val) => {
        const stock = stocks.find(s => s.type == val.type);
        return acc + (stock ? val.amount * stock.price : 0);
      }, 0);
    }
    const ownedStocks = user.stocks
    


    return (
      <div className="w-50/100 m-auto">
        <h1 className="text-lg mt-2">{user.name}</h1>
        <p>Select User:</p>
        <Combobox items={users} value={selectedUser} onValueChange={setSelectedUser}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item.name}>
                  {item.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p>Notification Settings:</p>
        <Combobox
          items={possibleNotificationPreferences}
          multiple
          value={notificationPrefs}
          onValueChange={setNotificationPrefs}
        >
          <ComboboxChips>
            <ComboboxValue>
              {notificationPrefs.map((item) => (
                <ComboboxChip key={item}>{item}</ComboboxChip>
              ))}
            </ComboboxValue>
            <ComboboxChipsInput placeholder="No Notifications"/>
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p>Capital: ${user.capital / 100}</p>
        <p>Portfolio Value: ${totalValue / 100}</p>
        <DataTable columns={columnDef} data={ownedStocks ?? []} />
        <h2>Pending Orders</h2>
        <DataTable columns={pendingColumnDef} data={pendingTrades ?? []} />
        
      </div>
    )
}