"use client"

import { useEffect, useState } from "react"
import { getReminders } from "@/app/actions/reminders"
import { RemindersTable } from "@/components/reminders/reminders-table"
import { EmptyState } from "@/components/reminders/empty-state"

export function RemindersClient() {
  const [reminders, setReminders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReminders() {
      try {
        const { reminders, error } = await getReminders()
        if (error) {
          setError(error)
        } else {
          setReminders(reminders || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadReminders()
  }, [])

  if (loading) {
    return <div>Loading reminders...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading reminders: {error}</div>
  }

  if (!reminders || reminders.length === 0) {
    return <EmptyState />
  }

  return <RemindersTable initialReminders={reminders} />
} 