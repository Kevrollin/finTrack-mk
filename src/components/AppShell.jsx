import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { AppIcon } from './AppIcon'
import styles from './AppShell.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )},
  { to: '/transactions', label: 'Transactions', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5H15M3 9H11M3 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 14L6 9L9 12L13 6L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

const adminItem = { to: '/admin', label: 'Admin', icon: <AppIcon name="secure" size={18} /> }

export default function AppShell() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className={styles.shell}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>₣</span>
            <span className={styles.logoText}>FinTrack</span>
          </div>

          <nav className={styles.nav}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to={adminItem.to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={styles.navIcon}>{adminItem.icon}</span>
                <span className={styles.navLabel}>{adminItem.label}</span>
              </NavLink>
            )}
          </nav>

          <div className={styles.sidebarBottom}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{userInitial}</div>
              <div className={styles.userDetails}>
                <div className={styles.userEmail}>{user?.email}</div>
                <div className={styles.userPlan}>Free plan</div>
              </div>
            </div>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, fontSize: 13 }}>
              <Link to="/terms" style={{ color: 'var(--text-muted)' }}>Terms</Link>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}

      {/* MAIN */}
      <main className={styles.main}>
        {/* MOBILE HEADER */}
        <header className={styles.mobileHeader}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>₣</span>
            <span className={styles.logoText}>FinTrack</span>
          </div>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className={styles.bottomNav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to={adminItem.to}
              className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}
            >
              {adminItem.icon}
              <span>{adminItem.label}</span>
            </NavLink>
          )}
        </nav>
      </main>
    </div>
  )
}
