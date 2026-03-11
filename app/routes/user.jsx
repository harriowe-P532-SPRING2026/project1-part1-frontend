import { useEffect } from "react"
import { DataTable } from "../components/DataTable"
import useStockStore from "../lib/stockStore"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

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
    const stocks = useStockStore(state => state.stocks)
    const fetchUser = useStockStore(state => state.fetchUser)
    const pendingTrades = useStockStore(state => state.pendingTrades)
    const fetchPendingTrades = useStockStore(state => state.fetchPendingTrades)
    let totalValue = 0;
    if (user?.stocks && stocks) {
      totalValue = user.stocks.reduce((acc, val) => acc + (val.amount * stocks.find(s => s.type == val.type).price), 0);
    }
    
    if (!user) {
      return (
        "Loading"
      )
    }
    const ownedStocks = user.stocks

  
    

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
      console.log(pendingTrades)
    }, [pendingTrades])
    


    return (
      <div className="w-50/100 m-auto">
        <h1 className="text-lg mt-2">{user.name}</h1>
        <p>Capital: ${user.capital / 100}</p>
        <p>Portfolio Value: ${totalValue / 100}</p>
        <DataTable columns={columnDef} data={ownedStocks ?? []} />
        <h2>Pending Orders</h2>
        <DataTable columns={pendingColumnDef} data={pendingTrades ?? []} />
        
      </div>
    )
}