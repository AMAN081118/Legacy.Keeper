"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache TTL in milliseconds
const CACHE_TTL = {
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  USER_ROLES: 10 * 60 * 1000, // 10 minutes
  STATIC_DATA: 30 * 60 * 1000, // 30 minutes
}

function getCacheKey(table: string, query: string, userId?: string): string {
  return `${table}:${query}:${userId || 'global'}`
}

function isValidCache(item: { timestamp: number; ttl: number }): boolean {
  return Date.now() - item.timestamp < item.ttl
}

function setCache(key: string, data: any, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

function getCache(key: string): any | null {
  const item = cache.get(key)
  if (item && isValidCache(item)) {
    return item.data
  }
  cache.delete(key)
  return null
}

// Create optimized client with caching
export function createOptimizedClient() {
  const supabase = createClientComponentClient<Database>()

  return {
    ...supabase,
    
    // Cached user profile fetch
    async getUserProfile(userId: string) {
      const cacheKey = getCacheKey('users', 'profile', userId)
      const cached = getCache(cacheKey)
      
      if (cached) {
        return { data: cached, error: null }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setCache(cacheKey, data, CACHE_TTL.USER_PROFILE)
      }

      return { data, error }
    },

    // Cached user roles fetch
    async getUserRoles(userId: string) {
      const cacheKey = getCacheKey('user_roles', 'roles', userId)
      const cached = getCache(cacheKey)
      
      if (cached) {
        return { data: cached, error: null }
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles:role_id(name, description),
          related_users:related_user_id(name, email)
        `)
        .eq('user_id', userId)

      if (!error && data) {
        setCache(cacheKey, data, CACHE_TTL.USER_ROLES)
      }

      return { data, error }
    },

    // Cached roles fetch
    async getRoles() {
      const cacheKey = getCacheKey('roles', 'all')
      const cached = getCache(cacheKey)
      
      if (cached) {
        return { data: cached, error: null }
      }

      const { data, error } = await supabase
        .from('roles')
        .select('*')

      if (!error && data) {
        setCache(cacheKey, data, CACHE_TTL.STATIC_DATA)
      }

      return { data, error }
    },

    // Batch fetch multiple tables
    async batchFetch(userId: string, tables: string[]) {
      const promises = tables.map(table => {
        switch (table) {
          case 'transactions':
            return supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: false })
              .limit(5)
          case 'reminders':
            return supabase
              .from('reminders')
              .select('*')
              .eq('user_id', userId)
              .order('start_date', { ascending: false })
              .limit(5)
          case 'requests':
            return supabase
              .from('requests')
              .select('*')
              .eq('recipient_id', userId)
          case 'trustees':
            return supabase
              .from('trustees')
              .select('*')
              .eq('user_id', userId)
          case 'nominees':
            return supabase
              .from('nominees')
              .select('*')
              .eq('user_id', userId)
          default:
            return Promise.resolve({ data: null, error: null })
        }
      })

      const results = await Promise.all(promises)
      
      return tables.reduce((acc, table, index) => {
        acc[table] = results[index]
        return acc
      }, {} as Record<string, any>)
    },

    // Clear cache for specific user
    clearUserCache(userId: string) {
      const keysToDelete = Array.from(cache.keys()).filter(key => 
        key.includes(userId)
      )
      keysToDelete.forEach(key => cache.delete(key))
    },

    // Clear all cache
    clearAllCache() {
      cache.clear()
    }
  }
}

// Export singleton instance
export const optimizedClient = createOptimizedClient()
