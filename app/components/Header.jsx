import useStockStore from '@/lib/stockStore'
import { useEffect } from 'react'
import { Link } from 'react-router'

export default function Header() {
    const user = useStockStore((state) => state.user)
    const notification = useStockStore((state) => state.notification)
    const notifications = useStockStore((state) => state.notifications)
    const clearNotification = useStockStore((state) => state.clearNotification)

    useEffect(() => {
        if (notification != null) {
            setTimeout(clearNotification, 5000);
        }
    }, [notification])


    return (
        <div className="h-10 bg-blue-100 flex justify-between content-center">
            <div className="flex">
                <Link to={"/"} className='p-1'>
                Home
                </Link>
                <Link to={"/trades"} className='p-1'>
                Trade History
                </Link>
                <Link to={"/algorithim"} className='p-1'>
                Pricing Algorithim
                </Link>
            </div>
            <div className="flex">
                
                <p className='p-1'>
                    {notification ? notification : notifications == 0 ? "No Notifications" : notifications + " Notifications"}
                </p>
                <Link to={"/user"} className='p-1'>
                {user?.name ?? "Logged Out"}
                </Link>
            </div>
        </div>
    )
}