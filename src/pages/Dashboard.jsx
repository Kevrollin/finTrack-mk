import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../hooks/useAuth'
import AddTransactionModal from '../components/AddTransactionModal'
import TransactionItem from '../components/TransactionItem'
import StatCard from '../components/StatCard'
import { AppIcon } from '../components/AppIcon'
import styles from './Dashboard.module.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions, loading, fetchTransactions, addTransaction, deleteTransaction } = useTransactions()
  const { categories, fetchCategories } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchTransactions({ month: selectedMonth, year: selectedYear })
  }, [fetchTransactions, selectedMonth, selectedYear])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
  const balance = totalIncome - totalExpenses

  const handleAdd = async (payload) => {
    await addTransaction(payload)
    setShowModal(false)
  }

  const firstName = user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{greeting}, {firstName} <Sparkles size={18} className={styles.greetingIcon} /></h1>
          <p className={styles.sub}>Here's your financial snapshot</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add transaction
        </button>
      </div>

      {/* MONTH SELECTOR */}
      <div className={styles.monthRow}>
        {MONTHS.map((m, i) => (
          <button
            key={m}
            className={`${styles.monthBtn} ${selectedMonth === i + 1 ? styles.monthBtnActive : ''}`}
            onClick={() => setSelectedMonth(i + 1)}
          >{m}</button>
        ))}
      </div>

      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Balance"
          value={balance}
          prefix="KSh "
          color={balance >= 0 ? 'var(--accent)' : 'var(--expense)'}
          icon={<AppIcon name="balance" size={18} />}
          delay={0}
        />
        <StatCard
          label="Income"
          value={totalIncome}
          prefix="KSh "
          color="var(--income)"
          icon={<AppIcon name="income" size={18} />}
          delay={0.05}
        />
        <StatCard
          label="Expenses"
          value={totalExpenses}
          prefix="KSh "
          color="var(--expense)"
          icon={<AppIcon name="expense" size={18} />}
          delay={0.1}
        />
        <StatCard
          label="Transactions"
          value={transactions.length}
          color="var(--text)"
          icon={<AppIcon name="transactions" size={18} />}
          delay={0.15}
          noDecimal
        />
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent transactions</h2>
          <span className={styles.count}>{transactions.length} total</span>
        </div>

        {loading ? (
          <div className={styles.loadingList}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><AppIcon name="coins" size={22} /></div>
            <p>No transactions this month</p>
            <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>
              Add your first transaction
            </button>
          </div>
        ) : (
          <div className={styles.txList}>
            {transactions.slice(0, 20).map((tx, i) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onDelete={deleteTransaction}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          categories={categories}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  )
}
