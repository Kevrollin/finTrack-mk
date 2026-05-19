import styles from './StatCard.module.css'

export default function StatCard({ label, value, prefix = '', color, icon, delay = 0, noDecimal = false }) {
  const formatted = noDecimal
    ? value?.toLocaleString('en-US')
    : value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className={styles.card} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.value} style={{ color }}>
        {prefix}{formatted}
      </div>
    </div>
  )
}
