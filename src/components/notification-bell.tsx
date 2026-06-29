'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BellIcon, CheckIcon, Trash2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Notification = Database['public']['Tables']['notifications']['Row']

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    setNotifications(prev => prev.filter(n => n.id !== id))
    const deleted = notifications.find(n => n.id === id)
    if (deleted && !deleted.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button aria-label="Notifications" size="icon" variant="ghost" className="relative">
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unreadCount} belum dibaca
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi
          </div>
        ) : (
          notifications.slice(0, 10).map(n => (
            <DropdownMenuItem
              key={n.id}
              className={cn(
                'flex-col items-start gap-1 p-3 cursor-default',
                !n.is_read && 'bg-accent/50'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={cn('h-2 w-2 rounded-full', typeStyles[n.type])} />
                <span className="font-medium text-sm flex-1">{n.title}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{n.message}</p>
              <div className="flex gap-1 mt-1 pl-4">
                {!n.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => markAsRead(n.id)}
                  >
                    <CheckIcon className="h-3 w-3 mr-1" /> Tandai dibaca
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => deleteNotification(n.id)}
                >
                  <Trash2Icon className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
