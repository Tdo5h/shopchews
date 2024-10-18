"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getAllOrders } from "@/utils/orderUtils"  // Updated import

export default function History() {
  const [completedOrders, setCompletedOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCompletedOrders() {
      setIsLoading(true)
      try {
        const allOrders = await getAllOrders()
        const completed = allOrders.filter(order => order.status === "completed")
        setCompletedOrders(completed)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedOrders()
  }, [])

  if (isLoading) return <p className="p-4">Loading completed orders...</p>
  if (error) return <p className="p-4">Error: {error}</p>

  return (
    <div className="h-full overflow-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {completedOrders.length === 0 ? (
        <p>No completed orders found.</p>
      ) : (
        completedOrders.map(order => (
          <Card key={order.id} className="mb-3">
            <CardContent className="p-3">
              <h3 className="font-semibold">Order #{order.id}</h3>
              <p className="text-sm">Total: ${order.total}</p>
              <p className="text-sm">Completed At: {new Date(order.completedAt || order.createdAt).toLocaleString()}</p>
              <h4 className="text-sm font-semibold mt-2">Items:</h4>
              <ul className="text-sm">
                {order.items && order.items.map((item, index) => (
                  <li key={index}>{item.name} - Quantity: {item.quantity}, Price: ${item.price}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
