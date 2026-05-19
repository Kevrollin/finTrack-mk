import { Link } from 'react-router-dom'
import styles from './Legal.module.css'

export default function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Privacy Policy</h1>
        <p>Last updated: May 19, 2026</p>

        <section>
          <h2>Overview</h2>
          <p>
            FinTrack uses Supabase for authentication and data storage. We store
            only the data you enter (transactions, categories, and minimal profile
            info). We do not sell your data.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            Your data remains in your Supabase project. You can delete your account
            through Supabase Auth, and your associated rows are removed per RLS
            policies and cascade rules.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            This project uses Supabase for backend services. Check Supabase's
            privacy policy for more details on how they process data.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy concerns, contact the project steward at
            <strong> kelvincodes25@gmail.com</strong>.
          </p>
        </section>

        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
