import { Link } from 'react-router-dom'
import styles from './Legal.module.css'

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1>Terms & Conditions</h1>
        <p>Last updated: May 19, 2026</p>

        <section>
          <h2>Scope</h2>
          <p>
            FinTrack is a lightweight tool to help you log and view your personal
            financial transactions. It helps visualize trends and organize
            spending, but it is not a financial advisor.
          </p>
        </section>

        <section>
          <h2>No Financial Advice</h2>
          <p>
            The content and functionality provided by FinTrack are for informational
            and organizational purposes only and do not constitute professional
            financial, investment, tax, legal, or accounting advice. You should not
            rely on FinTrack as a substitute for professional advice. Always
            consult a qualified advisor for financial decisions.
          </p>
        </section>

        <section>
          <h2>User Responsibilities</h2>
          <p>
            You are responsible for the accuracy of data you enter into FinTrack.
            Secure your account credentials and keep backups of important data.
          </p>
        </section>

        <section>
          <h2>Service Changes</h2>
          <p>
            The project maintainer may update, modify, or deprecate features from time
            to time. You are encouraged to review these Terms periodically.
          </p>
        </section>

        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
