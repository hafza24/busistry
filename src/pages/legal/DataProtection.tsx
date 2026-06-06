import LegalLayout from "./LegalLayout";

const DataProtection = () => (
  <LegalLayout
    title="Data Protection"
    description="How Busistree safeguards your data — security controls, retention, and your rights."
    path="/legal/data-protection"
    updated="June 2026"
  >
    <p>
      Busistree takes the security of customer and end-user data seriously. This document describes the
      organizational and technical controls we use to protect data on our platform.
    </p>

    <h2>1. Security Controls</h2>
    <ul>
      <li>All data is transmitted over HTTPS/TLS.</li>
      <li>Database access is protected by Row-Level Security (RLS) policies — users can only read their own data.</li>
      <li>Payment screenshots are stored in a private, access-controlled storage bucket.</li>
      <li>Sensitive integration credentials (e.g. WordPress logins) are encrypted at rest via a secure edge function.</li>
      <li>Administrative actions are logged in an internal audit log.</li>
    </ul>

    <h2>2. Authentication</h2>
    <ul>
      <li>Passwords are hashed and never stored in plain text.</li>
      <li>Failed-login throttling protects against brute-force attempts.</li>
      <li>OAuth (Google) sign-in is supported as an alternative to passwords.</li>
    </ul>

    <h2>3. Data Retention</h2>
    <p>
      We retain your account and order data for as long as your account is active and for up to 24 months after closure
      to meet financial-record and dispute-resolution obligations under Pakistani law. After that period, personal data
      is deleted or anonymized.
    </p>

    <h2>4. Sub-Processors</h2>
    <p>
      We use a small number of vetted sub-processors for hosting, database, file storage, email delivery,
      and (optionally) WordPress hosting. Each is bound by a confidentiality agreement.
    </p>

    <h2>5. Data Breach Notification</h2>
    <p>
      In the unlikely event of a security incident affecting your personal data, we will notify you and any relevant
      Pakistani authority without undue delay, and provide remediation guidance.
    </p>

    <h2>6. Your Rights &amp; Requests</h2>
    <p>
      To exercise any data right (access, correction, deletion, portability), email
      <a className="text-primary underline" href="mailto:hello@busistree.com"> hello@busistree.com</a>. We respond within 30 days.
    </p>
  </LegalLayout>
);

export default DataProtection;
