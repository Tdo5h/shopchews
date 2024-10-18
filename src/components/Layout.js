"use client"

import { useState } from "react"
import Link from 'next/link'
import { Bell, Settings, History, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Layout({ children }) {
  const [notifications, setNotifications] = useState(2)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-black p-4 flex justify-between items-center">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <Link href="/" passHref>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                  Orders
                </Button>
              </Link>
              <Link href="/history" passHref>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-col items-center">
          <span className="text-white text-xs mb-1">Restaurant</span>
          <div className="flex items-center space-x-2">
            <span className="text-white text-xs">Off</span>
            <Switch className="data-[state=checked]:bg-blue-500" />
            <span className="text-white text-xs">On</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="text-white" />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {notifications}
            </span>
          )}
        </Button>
      </nav>
      <main className="flex-grow overflow-auto">
        {children}
      </main>
    </div>
  )
}
