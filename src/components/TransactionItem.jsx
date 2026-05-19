import { useState } from 'react'
import { format } from 'date-fns'
import { AppIcon } from './AppIcon'
import { formatKsh } from '../lib/formatCurrency'
import styles from './TransactionItem.module.css'

export default function TransactionItem({ transaction: tx, onDelete, style }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try {
      await onDelete(tx.id)
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  const formattedDate = (() => {
    try { return format(new Date(tx.transaction_date + 'T00:00:00'), 'MMM d') }
    catch { return tx.transaction_date }
  })()

  const formattedAmount = parseFloat(tx.amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const cat = tx.categories
  const isIncome = tx.type === 'income'

  return (
    <div
      className={`${styles.item} ${deleting ? styles.deleting : ''} animate-fade-in`}
      style={style}
      onMouseLeave={() => setConfirming(false)}
    >
      {/* ICON */}
      <div
        className={styles.iconWrap}
        style={{ background: cat?.color ? `${cat.color}22` : 'var(--bg-hover)', borderColor: cat?.color ? `${cat.color}44` : 'var(--border)' }}
      >
        <AppIcon name={cat?.icon || (isIncome ? 'income' : 'creditcard')} size={16} className={styles.icon} />
      </div>

      {/* INFO */}
      <div className={styles.info}>
        <div className={styles.name}>{tx.name}</div>
        <div className={styles.meta}>
          {cat && <span className={styles.cat}>{cat.name}</span>}
          {cat && <span className={styles.dot}>·</span>}
          <span className={styles.date}>{formattedDate}</span>
          {tx.note && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.note}>{tx.note}</span>
            </>
          )}
        </div>
      </div>

      {/* AMOUNT */}
      <div className={`${styles.amount} ${isIncome ? styles.income : styles.expense}`}>
        {isIncome ? '+' : '-'}{formatKsh(formattedAmount)}
      </div>

      {/* DELETE */}
      <button
        className={`${styles.deleteBtn} ${confirming ? styles.deleteBtnConfirm : ''}`}
        onClick={handleDelete}
        disabled={deleting}
        title={confirming ? 'Click again to confirm' : 'Delete'}
      >
        {deleting ? (
          <span className="spinner" style={{ width: 14, height: 14 }} />
        ) : confirming ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5H12M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}
