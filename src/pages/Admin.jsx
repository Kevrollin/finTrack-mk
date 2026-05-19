import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatKsh } from '../lib/formatCurrency'
import { AppIcon } from '../components/AppIcon'
import styles from './Admin.module.css'

export default function Admin() {
  const [profiles, setProfiles] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')

      const [{ data: profilesData, error: profilesError }, { data: txData, error: txError }] = await Promise.all([
        supabase.from('profiles').select('user_id, email, full_name, is_admin, created_at').order('created_at', { ascending: false }),
        supabase.from('transactions').select('id, user_id, name, amount, type, transaction_date, created_at').order('created_at', { ascending: false }),
      ])

      if (!mounted) return

      if (profilesError || txError) {
        setError(profilesError?.message || txError?.message || 'Failed to load admin data')
      } else {
        setProfiles(profilesData || [])
        setTransactions(txData || [])
      }

      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [])

  const users = useMemo(() => {
    return profiles.map((profile) => {
      const userTransactions = transactions.filter((tx) => tx.user_id === profile.user_id)
      const income = userTransactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0)
      const expenses = userTransactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0)
      const lastActivity = userTransactions[0]?.created_at || profile.created_at

      return {
        ...profile,
        transactionCount: userTransactions.length,
        income,
        expenses,
        balance: income - expenses,
        lastActivity,
      }
    })
  }, [profiles, transactions])

  const totalUsers = users.length
  const adminUsers = users.filter((user) => user.is_admin).length
  const totalTransactions = transactions.length
  const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin panel</h1>
          <p className={styles.sub}>Monitor users and their transaction activity</p>
        </div>
        <div className={styles.badge}><AppIcon name="secure" size={14} /> Admin only</div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading admin data…</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Users</div>
              <div className={styles.cardValue}>{totalUsers}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Admins</div>
              <div className={styles.cardValue}>{adminUsers}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Transactions</div>
              <div className={styles.cardValue}>{totalTransactions}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Volume</div>
              <div className={styles.cardValue}>{formatKsh(totalVolume)}</div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Transactions</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Balance</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{(user.full_name || user.email || '?')[0].toUpperCase()}</div>
                        <div>
                          <div className={styles.userName}>{user.full_name || 'Unnamed user'}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.status} ${user.is_admin ? styles.statusAdmin : styles.statusUser}`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{user.transactionCount}</td>
                    <td>{formatKsh(user.income)}</td>
                    <td>{formatKsh(user.expenses)}</td>
                    <td>{formatKsh(user.balance)}</td>
                    <td>{user.lastActivity ? new Date(user.lastActivity).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}