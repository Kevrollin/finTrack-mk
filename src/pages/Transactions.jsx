import { useEffect, useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import AddTransactionModal from '../components/AddTransactionModal'
import TransactionItem from '../components/TransactionItem'
import { AppIcon } from '../components/AppIcon'
import { formatKsh } from '../lib/formatCurrency'
import styles from './Transactions.module.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Transactions() {
  const { transactions, loading, fetchTransactions, addTransaction, deleteTransaction } = useTransactions()
  const { categories, fetchCategories } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchTransactions({ month: selectedMonth, year: selectedYear, limit: 200 })
  }, [fetchTransactions, selectedMonth, selectedYear])

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = !search || tx.name.toLowerCase().includes(search.toLowerCase()) ||
        tx.categories?.name?.toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'all' || tx.type === filterType
      const matchesCat = filterCategory === 'all' || tx.category_id === filterCategory
      return matchesSearch && matchesType && matchesCat
    })
  }, [transactions, search, filterType, filterCategory])

  const handleAdd = async (payload) => {
    await addTransaction(payload)
    setShowModal(false)
  }

  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.sub}>All your financial activity in one place</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add transaction
        </button>
      </div>

      {/* MONTH STRIP */}
      <div className={styles.monthRow}>
        {MONTHS.map((m, i) => (
          <button
            key={m}
            className={`${styles.monthBtn} ${selectedMonth === i + 1 ? styles.monthBtnActive : ''}`}
            onClick={() => setSelectedMonth(i + 1)}
          >{m}</button>
        ))}
      </div>

      {/* SUMMARY BAR */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Showing</span>
          <span className={styles.summaryVal}>{filtered.length} transactions</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Income</span>
          <span className={styles.summaryVal} style={{ color: 'var(--income)' }}>
            +{formatKsh(totalIncome)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Expenses</span>
          <span className={styles.summaryVal} style={{ color: 'var(--expense)' }}>
            -{formatKsh(totalExpenses)}
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className={styles.filterGroup}>
          {['all', 'expense', 'income'].map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filterType === t ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterType(t)}
            >
                {t === 'all' ? 'All' : (
                  <>
                    <AppIcon name={t} size={14} />
                    <span>{t === 'expense' ? 'Expenses' : 'Income'}</span>
                  </>
                )}
            </button>
          ))}
        </div>

        <select
          className={styles.catSelect}
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* LIST */}
      <div className={styles.listCard}>
        {loading ? (
          <div className={styles.loadingList}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} style={{ animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><AppIcon name={search ? 'search' : 'coins'} size={22} /></div>
            <p>{search ? `No results for "${search}"` : 'No transactions this month'}</p>
            {!search && (
              <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>
                Add your first transaction
              </button>
            )}
          </div>
        ) : (
          <div className={styles.txList}>
            {filtered.map((tx, i) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onDelete={deleteTransaction}
                style={{ animationDelay: `${Math.min(i, 10) * 0.04}s` }}
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
