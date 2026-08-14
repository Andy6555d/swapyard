export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-mark"></span>SwapYard
          </div>
          <p className="footer-tagline">
            A noticeboard for independent merchants to move surplus and end-of-line stock.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">Platform</span>
            <a href="/">Home</a>
            <a href="/browse">Browse Stock</a>
            <a href="/requests">Requests</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Legal</span>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Contact</span>
            <a href="mailto:hello@swapyard.ie">hello@swapyard.ie</a>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {year} SwapYard. All rights reserved.</span>
        <span>Not affiliated with any single merchant or manufacturer.</span>
      </div>
    </footer>
  );
}
