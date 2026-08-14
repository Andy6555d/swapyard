import { login } from '../actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="wrap">
      <div className="auth-shell">
        <h1>Welcome back</h1>
        <p className="sub">Log in to browse and list stock.</p>
        {params.error && <div className="error-box">{params.error}</div>}
        <form action={login}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Log In
          </button>
        </form>
        <div className="auth-switch">
          New outlet? <a href="/signup">Register here</a>
        </div>
      </div>
    </div>
  );
}
