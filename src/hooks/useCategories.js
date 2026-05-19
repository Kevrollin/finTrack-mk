import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      setCategories(data || [])
      return data
    } catch (e) {
      console.error('Categories fetch error:', e)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { categories, loading, fetchCategories }
}
