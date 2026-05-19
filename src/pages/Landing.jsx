import { Link } from 'react-router-dom'
import { AppIcon } from '../components/AppIcon'
import { formatKsh } from '../lib/formatCurrency'
import styles from './Landing.module.css'

const features = [
  { icon: 'logging', title: 'Instant Logging', desc: 'Add income or expenses in seconds. No friction, just facts.' },
  { icon: 'analytics', title: 'Smart Analytics', desc: 'Visual breakdowns of where your money actually goes.' },
  { icon: 'tags', title: 'Category Tracking', desc: 'Auto-sorted into meaningful categories. Always organized.' },
  { icon: 'secure', title: 'Private & Secure', desc: 'Your data belongs to you. End-to-end protected via Supabase.' },
]

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.logoMark}>₣</span>
          <span>FinTrack</span>
        </div>
        <div className={styles.navActions}>
          <Link to="/auth?mode=login" className={styles.navLink}>Sign in</Link>
          <Link to="/auth?mode=signup" className={styles.btnPrimary}>Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>Free forever · No credit card</div>
        <h1 className={styles.heroTitle}>
          Know exactly where<br />
          <span className={styles.accent}>your money goes</span>
        </h1>
        <p className={styles.heroSub}>
          FinTrack is the no-nonsense personal finance tracker for people who want clarity, not complexity. Log transactions, see trends, take control.
        </p>
        <div className={styles.heroCta}>
          <Link to="/auth?mode=signup" className={styles.btnPrimary}>Start tracking free →</Link>
          <Link to="/auth?mode=login" className={styles.btnGhost}>Sign in</Link>
        </div>

        {/* MOCK UI */}
        <div className={styles.mockUi}>
          <div className={styles.mockHeader}>
            <span className={styles.mockDot} style={{ background: '#ff5f57' }} />
            <span className={styles.mockDot} style={{ background: '#ffbd2e' }} />
            <span className={styles.mockDot} style={{ background: '#28ca41' }} />
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>fintrack.app/dashboard</span>
          </div>
          <div className={styles.mockBody}>
            <div className={styles.mockStats}>
              {[
                { label: 'Balance', value: formatKsh(2840), color: 'var(--accent)' },
                { label: 'Income', value: formatKsh(4200), color: 'var(--income)' },
                { label: 'Expenses', value: formatKsh(1360), color: 'var(--expense)' },
              ].map(s => (
                <div key={s.label} className={styles.mockStat}>
                  <div className={styles.mockStatLabel}>{s.label}</div>
                  <div className={styles.mockStatValue} style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className={styles.mockTxList}>
              {[
                { icon: 'food', name: 'Lunch at Joe\'s', amount: `-${formatKsh(14.5)}`, cat: 'Food' },
                { icon: 'salary', name: 'Client payment', amount: `+${formatKsh(800)}`, cat: 'Income' },
                { icon: 'transport', name: 'Uber ride', amount: `-${formatKsh(9.8)}`, cat: 'Transport' },
                { icon: 'shopping', name: 'Amazon order', amount: `-${formatKsh(67)}`, cat: 'Shopping' },
              ].map((t, i) => (
                <div key={i} className={styles.mockTx}>
                  <span className={styles.mockTxIcon}><AppIcon name={t.icon} size={16} /></span>
                  <div className={styles.mockTxInfo}>
                    <div className={styles.mockTxName}>{t.name}</div>
                    <div className={styles.mockTxCat}>{t.cat}</div>
                  </div>
                  <div className={styles.mockTxAmount} style={{ color: t.amount.startsWith('+') ? 'var(--income)' : 'var(--expense)' }}>
                    {t.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
        <div className={styles.featuresGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}><AppIcon name={f.icon} size={18} /></div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner}>
        <h2>Ready to take control?</h2>
        <p>Join thousands managing their finances smarter.</p>
        <Link to="/auth?mode=signup" className={styles.btnPrimary}>Create free account →</Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className={styles.logoMark}>₣</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>FinTrack © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/terms" className={styles.footerLink}>Terms</Link>
          <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
        </div>
      </footer>
    </div>
  )
}
