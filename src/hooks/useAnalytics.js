import { useState, useCallback } from 'react'
import { callEdgeFunction } from '../lib/supabase'

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async (month, year) => {
    setLoading(true)
    setError(null)
    try {
      const result = await callEdgeFunction('get-analytics', {
        params: {
          month: String(month),
          year: String(year),
        },
      })
      setAnalytics(result.data)
      return result.data
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { analytics, loading, error, fetchAnalytics }
}
