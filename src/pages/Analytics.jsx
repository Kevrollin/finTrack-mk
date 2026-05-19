import { useEffect, useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { AppIcon } from '../components/AppIcon'
import { formatKsh } from '../lib/formatCurrency'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import styles from './Analytics.module.css'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} className={styles.tooltipRow}>
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{formatKsh(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const { analytics, loading, fetchAnalytics } = useAnalytics()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAnalytics(selectedMonth, selectedYear)
  }, [fetchAnalytics, selectedMonth, selectedYear])

  const fmt = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'

  const monthlyData = analytics?.monthlyHistory?.map(m => ({
    name: MONTHS[m.month - 1],
    Income: m.income,
    Expenses: m.expenses,
    Savings: Math.max(0, m.income - m.expenses),
  })) || []

  const pieData = analytics?.categoryBreakdown?.slice(0, 8) || []

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.sub}>Understand your spending patterns</p>
        </div>
        <div className={styles.monthRow}>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              className={`${styles.monthBtn} ${selectedMonth === i + 1 ? styles.monthBtnActive : ''}`}
              onClick={() => setSelectedMonth(i + 1)}
            >{m}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`skeleton ${styles.skeletonCard}`} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : !analytics ? (
        <div className={styles.empty}>No data yet — add some transactions first!</div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard} style={{ borderColor: 'rgba(74,222,128,0.25)' }}>
              <div className={styles.summaryLabel}>Total Income</div>
              <div className={styles.summaryValue} style={{ color: 'var(--income)' }}>{formatKsh(analytics.totalIncome)}</div>
            </div>
            <div className={styles.summaryCard} style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
              <div className={styles.summaryLabel}>Total Expenses</div>
              <div className={styles.summaryValue} style={{ color: 'var(--expense)' }}>{formatKsh(analytics.totalExpenses)}</div>
            </div>
            <div className={styles.summaryCard} style={{ borderColor: analytics.netSavings >= 0 ? 'rgba(200,240,74,0.25)' : 'rgba(248,113,113,0.25)' }}>
              <div className={styles.summaryLabel}>Net Savings</div>
              <div className={styles.summaryValue} style={{ color: analytics.netSavings >= 0 ? 'var(--accent)' : 'var(--expense)' }}>
                {analytics.netSavings < 0 ? '-' : ''}{formatKsh(Math.abs(analytics.netSavings))}
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Savings Rate</div>
              <div className={styles.summaryValue}>
                {analytics.totalIncome > 0
                  ? `${Math.round((analytics.netSavings / analytics.totalIncome) * 100)}%`
                  : '—'}
              </div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className={styles.chartsRow}>
            {/* 6-month bar chart */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>6-Month Overview</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `KSh ${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Income" fill="#4ade80" radius={[4,4,0,0]} />
                  <Bar dataKey="Expenses" fill="#f87171" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Spending by category pie */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Spending by Category</h3>
              {pieData.length === 0 ? (
                <div className={styles.noData}>No expense data this month</div>
              ) : (
                <div className={styles.pieWrapper}>
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} opacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [formatKsh(v), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.pieLegend}>
                    {pieData.map((cat, i) => (
                      <div key={i} className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: cat.color }} />
                        <span className={styles.legendName}><AppIcon name={cat.icon} size={14} /> {cat.name}</span>
                        <span className={styles.legendPct}>{cat.percentage.toFixed(1)}%</span>
                        <span className={styles.legendAmt}>{formatKsh(cat.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SAVINGS TREND */}
          {monthlyData.length > 0 && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Savings Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c8f04a" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#c8f04a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `KSh ${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Savings" stroke="#c8f04a" strokeWidth={2} fill="url(#savingsGrad)" dot={{ fill: '#c8f04a', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CATEGORY BARS */}
          {pieData.length > 0 && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Category Breakdown</h3>
              <div className={styles.catBars}>
                {pieData.map((cat, i) => (
                  <div key={i} className={styles.catBar}>
                    <div className={styles.catBarLabel}>
                      <span><AppIcon name={cat.icon} size={14} /> {cat.name}</span>
                      <span>{formatKsh(cat.total)}</span>
                    </div>
                    <div className={styles.catBarTrack}>
                      <div
                        className={styles.catBarFill}
                        style={{
                          width: `${cat.percentage}%`,
                          background: cat.color,
                          animationDelay: `${i * 0.06}s`
                        }}
                      />
                    </div>
                    <span className={styles.catBarPct}>{cat.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
