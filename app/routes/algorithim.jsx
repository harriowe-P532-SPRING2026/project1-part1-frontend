import { useEffect, useState } from "react";
import useStockStore from "../lib/stockStore";
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
  } from "@/components/ui/field"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"


export default function Algorithim() {
    const [strategy, setStrategy] = useState("randomWalk");
    const setStrategyServer = useStockStore((state) => state.setStrategy);
    const getStrategy = useStockStore((state) => state.getCurrentStrategy);

    useEffect(() => {
        async function getStrat() {
            const strat = await getStrategy();
            setStrategy(strat);
        }

        getStrat()
    }, [])

    async function changeAlgorithim() {
        await setStrategyServer(strategy)
    }

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="fieldgroup-orderType">Stock Pricing Algorithim</FieldLabel>
                <Select value={strategy} onValueChange={(e) => setStrategy(e)}>
                    <SelectTrigger id="fieldgroup-orderType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="randomWalk">Random Walk</SelectItem>
                        <SelectItem value="trendFollowing">Trend Following</SelectItem>
                        <SelectItem value="meanReversion">Mean Reversion</SelectItem>
                    </SelectContent>
                </Select>
            </Field>

            <Button type="submit" className="w-35 mt-2" onClick={(e) => changeAlgorithim()}>
                    Change Algorithim
            </Button>
        </FieldGroup>
    )
}