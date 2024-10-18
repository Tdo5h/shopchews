"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAllOrders, updateOrderStatus } from "@/utils/orderUtils"

export default function Home() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } else {
      console.error(`Failed to update status for order ${orderId}`);
    }
  };

  const renderOrders = (status) => {
    if (isLoading) return <p>Loading orders...</p>;
    if (error) return <p>Error fetching orders: {error}</p>;
    
    const filteredOrders = status === "Pending" 
      ? orders.filter(order => order.status === "pending" || order.status === "new" || !order.status)
      : status === "In Progress"
      ? orders.filter(order => order.status === "in_progress")
      : orders.filter(order => order.status === "ready");
    
    if (filteredOrders.length === 0) {
      return <p>No orders found for {status} status.</p>;
    }
    
    return filteredOrders.map(order => (
      <Card key={order.id} className="mb-3 relative">
        <CardContent className="p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Order #{order.id}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  {order.status || "Pending"} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleStatusChange(order.id, "in_progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange(order.id, "ready")}>
                  Ready for Pickup
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange(order.id, "completed")}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-xs">Total: ${order.total}</p>
          <p className="text-xs">Created At: {new Date(order.createdAt).toLocaleString()}</p>
          <p className="text-xs">Pickup Phrase: {order.pickupPhrase}</p>
          <h4 className="text-sm font-semibold mt-2">Items:</h4>
          <ul className="text-xs">
            {order.items && order.items.map((item, index) => (
              <li key={index}>{item.name} - Quantity: {item.quantity}, Price: ${item.price}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ));
  };

  return (
    <Tabs defaultValue="pending" className="h-full overflow-hidden">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="ready">Ready for Pickup</TabsTrigger>
      </TabsList>
      <TabsContent value="pending" className="h-full overflow-auto p-4">
        {renderOrders("Pending")}
      </TabsContent>
      <TabsContent value="in-progress" className="h-full overflow-auto p-4">
        {renderOrders("In Progress")}
      </TabsContent>
      <TabsContent value="ready" className="h-full overflow-auto p-4">
        {renderOrders("Ready")}
      </TabsContent>
    </Tabs>
  )
}

// ... (keep other exports like updateOrderStatus, etc.)
