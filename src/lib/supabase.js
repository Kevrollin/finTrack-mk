import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: call edge function with auth
export async function callEdgeFunction(name, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const { method = 'GET', body, params } = options
  let url = `${supabaseUrl}/functions/v1/${name}`
  if (params) {
    const qs = new URLSearchParams(params).toString()
    url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Edge function error')
  return json
}
