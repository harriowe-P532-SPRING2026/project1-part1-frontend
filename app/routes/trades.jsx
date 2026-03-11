import { useEffect } from "react"
import { DataTable } from "../components/DataTable"
import useStockStore from "../lib/stockStore"

const columnDef = [
    {
      accessorKey: "type",
      header: "Ticker",
    },
    {
        accessorKey: "side",
        header: "Buy/Sell"
    },
    {
        accessorKey: "quantity",
        header: "Quantity"
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
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
        accessorKey: "timestamp",
        header: "Time Traded",
        cell: ({row}) => {
            const formatted = new Intl.DateTimeFormat("en-US", {                                                                                                                                               
                dateStyle: "medium",                                                                                                                                                         
                timeStyle: "short",                                                                                                                                                            
              }).format(new Date(row.getValue("timestamp")))
            return <div className="text-right font-medium">{formatted}</div>
        }
    }
    
  ]

export default function Trades() {
    const fetchTrades = useStockStore((state) => state.fetchTrades)
    const trades = useStockStore((state) => (state.trades))

    useEffect(() => {
        fetchTrades();
    }, [])

    return (
        <div className="w-50/100 m-auto">
            <h1 className="text-lg">Past Trades</h1>
            <DataTable columns={columnDef} data={trades ?? []}/>
        </div>
    )
}