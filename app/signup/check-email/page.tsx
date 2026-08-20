export default function CheckEmailPage() {
  return (
    <div className="wrap">
      <div className="auth-shell">
        <h1>Check your email</h1>
        <p className="sub">
          We&apos;ve sent a confirmation link to the email address you signed up with. Click it
          to activate your account, then come back and log in.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--steel)', marginTop: '16px' }}>
          Can&apos;t find it? Check your spam or junk folder, it can take a minute or two to
          arrive.
        </p>
        <div className="auth-switch">
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}
