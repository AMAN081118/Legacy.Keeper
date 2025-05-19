"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getNotifications, type Notification } from "@/app/actions/notifications"
import { resendInvitation } from "@/app/actions/nominees"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const allNotifications = await getNotifications()
      setNotifications(allNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleResendInvitation = async (nomineeId: string) => {
    setLoading(true)
    try {
      const result = await resendInvitation(nomineeId)
      if (result.success) {
        toast({
          title: "Invitation resent",
          description: "The invitation has been resent successfully.",
        })
        // Refresh notifications after resending
        fetchNotifications()
      } else {
        toast({
          title: "Error",
          description: `Failed to resend invitation: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to resend invitation: ${error}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white"
              variant="destructive"
            >
              {notifications.length}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 hover:bg-gray-50 group relative">
                <button
                  className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                  onClick={() => handleDeleteNotification(notification.id)}
                  tabIndex={0}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex justify-between items-start">
                  <div>
                    {notification.type === "invitation_received" ? (
                      <>
                        <h4 className="text-sm font-medium">
                          {notification.data?.inviterName || "A user"} has requested to be their nominee
                        </h4>
                        {notification.data?.onboardingUrl && (
                          <Link href={notification.data.onboardingUrl} passHref>
                            <Button variant="default" size="sm" className="mt-2 text-xs">
                              View Request
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      </>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notification.type === "invitation_sent" && notification.data?.nomineeId && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => notification.data && handleResendInvitation(notification.data.nomineeId!)}
                          disabled={loading}
                        >
                          Resend
                        </Button>
                        <Link href="/dashboard/nominees" passHref>
                          <Button variant="secondary" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      </>
                    )}
                    {notification.type === "invitation_received" && !!notification.data?.invitationToken && (
                      <Link href={`/nominee-onboarding?token=${notification.data.invitationToken}`} passHref>
                        <Button variant="default" size="sm" className="mt-2 text-xs">
                          View Request
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
