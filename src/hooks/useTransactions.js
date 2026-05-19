import { useState, useCallback } from 'react'
import { supabase, callEdgeFunction } from '../lib/supabase'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async ({ limit = 50, offset = 0, month, year } = {}) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color)')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (month && year) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`
        const end = new Date(year, month, 0).toISOString().split('T')[0]
        query = query.gte('transaction_date', start).lte('transaction_date', end)
      }

      const { data, error: err } = await query
      if (err) throw err
      setTransactions(data || [])
      return data
    } catch (e) {
      setError(e.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addTransaction = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const result = await callEdgeFunction('add-transaction', {
        method: 'POST',
        body: payload,
      })
      setTransactions(prev => [result.data, ...prev])
      return result.data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    setError(null)
    try {
      await callEdgeFunction('delete-transaction', { params: { id } })
      setTransactions(prev => prev.filter(t => t.id !== id))
    } catch (e) {
      setError(e.message)
      throw e
    }
  }, [])

  return { transactions, loading, error, fetchTransactions, addTransaction, deleteTransaction }
}
