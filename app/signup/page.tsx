import { signup } from '../actions';
import { COUNTIES, BUYING_GROUPS } from '@/lib/constants';
import SubmitButton from '@/components/SubmitButton';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="wrap">
      <div className="auth-shell">
        <h1>Register your outlet</h1>
        <p className="sub">Independent merchants only — one account per outlet.</p>
        {params.error && <div className="error-box">{params.error}</div>}
        <form action={signup}>
          <div className="field">
            <label htmlFor="outletName">Outlet name</label>
            <input type="text" id="outletName" name="outletName" placeholder="e.g. Murphy's Builders Merchants" required />
          </div>
          <div className="field">
            <label htmlFor="county">County</label>
            <select id="county" name="county" required defaultValue="">
              <option value="" disabled>Select county</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="buyingGroup">Buying group (optional)</label>
            <select id="buyingGroup" name="buyingGroup" defaultValue="none">
              <option value="none">None / Independent</option>
              {BUYING_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <p className="upload-status" style={{ marginTop: '6px' }}>
              If you&apos;re part of a buying group, this lets you choose later whether to share
              a listing with everyone or just your own group. Claims are reviewed before that
              option unlocks, you can also set or change this anytime in Account.
            </p>
          </div>
          <div className="field">
            <label htmlFor="contactPhone">Contact phone (optional)</label>
            <input type="text" id="contactPhone" name="contactPhone" placeholder="01 234 5678" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" minLength={6} required />
          </div>
          <div className="field checkbox-field">
            <label className="checkbox-label">
              <input type="checkbox" name="agreeTerms" value="yes" required />
              <span>
                I agree to the <a href="/terms" target="_blank">Terms of Service</a> and{' '}
                <a href="/privacy" target="_blank">Privacy Policy</a>
              </span>
            </label>
          </div>
          <SubmitButton pendingText="Creating account…">Create Account</SubmitButton>
        </form>
        <div className="auth-switch">
          Already registered? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
