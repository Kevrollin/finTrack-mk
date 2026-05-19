import { useState, useEffect, useRef } from 'react'
import { AppIcon } from './AppIcon'
import styles from './AddTransactionModal.module.css'

const DEFAULT_FORM = {
  name: '',
  amount: '',
  type: 'expense',
  category_id: '',
  note: '',
  transaction_date: new Date().toISOString().split('T')[0],
}

export default function AddTransactionModal({ categories, onAdd, onClose, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Transaction name is required')
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
      return setError('Enter a valid positive amount')
    try {
      await onAdd({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
        category_id: form.category_id || null,
        note: form.note.trim() || null,
        transaction_date: form.transaction_date,
      })
    } catch (err) {
      setError(err.message || 'Failed to add transaction')
    }
  }

  const expenseCategories = categories.filter(c => !['Salary','Freelance','Investment'].includes(c.name))
  const incomeCategories = categories.filter(c => ['Salary','Freelance','Investment'].includes(c.name))
  const relevantCategories = form.type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Transaction</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* TYPE TOGGLE */}
          <div className={styles.typeTabs}>
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                className={`${styles.typeTab} ${form.type === t ? styles.typeTabActive : ''} ${t === 'expense' ? styles.typeTabExpense : styles.typeTabIncome}`}
                onClick={() => { set('type', t); set('category_id', '') }}
              >
                <AppIcon name={t} size={16} />
                <span>{t === 'expense' ? 'Expense' : 'Income'}</span>
              </button>
            ))}
          </div>

          {/* NAME */}
          <div className={styles.field}>
            <label className={styles.label}>Description *</label>
            <input
              ref={nameRef}
              className={styles.input}
              placeholder="e.g. Lunch at Joe's, Netflix subscription..."
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          {/* AMOUNT */}
          <div className={styles.field}>
            <label className={styles.label}>Amount *</label>
            <div className={styles.amountWrap}>
              <span className={styles.currency}>KSh</span>
              <input
                className={`${styles.input} ${styles.amountInput}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                required
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <div className={styles.catGrid}>
              {relevantCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.catChip} ${form.category_id === cat.id ? styles.catChipActive : ''}`}
                  style={form.category_id === cat.id ? { borderColor: cat.color, background: `${cat.color}18` } : {}}
                  onClick={() => set('category_id', form.category_id === cat.id ? '' : cat.id)}
                >
                    <AppIcon name={cat.icon} size={14} />
                  <span className={styles.catChipName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DATE + NOTE */}
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                className={styles.input}
                type="date"
                value={form.transaction_date}
                onChange={e => set('transaction_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Note (optional)</label>
              <input
                className={styles.input}
                placeholder="Any extra detail..."
                value={form.note}
                onChange={e => set('note', e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : `Add ${form.type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
