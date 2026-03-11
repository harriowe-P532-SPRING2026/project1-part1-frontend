import { Link, redirect, useNavigate } from "react-router";
import useStockStore from "../lib/stockStore";
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
  } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"



export default function Order({params}) {
    const stockType = params.type;
    const stock = useStockStore((state) => state.stocks.find(s => s.type == stockType))
    const queueTrade = useStockStore((state) => state.queueTrade)
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(stock?.price ?? 1);
    const [orderType, setOrderType] = useState("market");
    const [buyOrSell, setBuyOrSell] = useState("buy");

    let navigate = useNavigate();
    
    if (!stock) {
        return (
            <div>
                <h1>Invalid Stock Choice</h1>
                <Button varient={"outline"}>
                    <Link to={"/"}>
                        Pick Another
                    </Link>
                </Button>
            </div>
        )
    }

    async function submitOrder() {
        const order = {
            shares: quantity,
            price: orderType == "market" ? stock.price : price,
            stockType,
            buy: buyOrSell == "buy",
            orderType
        };
        const result = await queueTrade(order);
        console.log(result)
        if (result) {
            navigate("/user");
        } else {
            alert("Failed to order stock");
        }
    }

    return (
        <div className="w-50/100 m-auto">
            <h1>{stock.type}</h1>
            <p>${stock.price / 100}</p>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="fieldgroup-quantity">Quantity</FieldLabel>
                    <Input id="fieldgroup-quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}></Input>
                </Field>

                <Field>
                    <FieldLabel htmlFor="fieldgroup-orderType">Order Type</FieldLabel>
                    <Select value={orderType} onValueChange={(e) => setOrderType(e)}>
                        <SelectTrigger id="fieldgroup-orderType">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="market">Market Order</SelectItem>
                            <SelectItem value="limit">Limit Order</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                {
                    orderType == "market" ? 
                    <>
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-price">Price</FieldLabel>
                        <Input id="fieldgroup-price" type="number" value={stock.price / 100} disabled></Input>
                    </Field>
                    </> 
                    : 
                    <>
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-price">Price</FieldLabel>
                        <Input id="fieldgroup-price" type="number" value={price / 100} onChange={(e) => setPrice(Number(e.target.value) * 100)}></Input>
                    </Field>
                    </>
                }
                <Field>
                    <FieldLabel htmlFor="fieldgroup-buySell">Buy/Sell</FieldLabel>
                    <Select value={buyOrSell} onValueChange={(e) => setBuyOrSell(e)}>
                        <SelectTrigger id="fieldgroup-buySell">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Button type="submit" className="w-25 mt-2" onClick={(e) => submitOrder()}>
                    Submit
                </Button>

            </FieldGroup>
        </div>
    )
}