import { useState } from "react"
import { Outlet } from "react-router-dom"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { AppSidebar } from "@/components/layout/app-sidebar"

export function RootLayout() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex py-3 items-center justify-between border-b bg-background/95 backdrop-blur px-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-medium">UI Components</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </Button>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  )
}
