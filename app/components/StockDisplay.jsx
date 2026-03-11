import { useEffect } from "react";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button"
import useStockStore from "@/lib/stockStore";
import { Link } from "react-router";


const columnDef = [
  {
    accessorKey: "type",
    header: "Ticker",
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


export default function StockDisplay() {
  const stocks = useStockStore((state) => state.stocks)
  

  return (
    <DataTable className="w-md" columns={columnDef} data={stocks ?? []} />
  )
}