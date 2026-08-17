export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <div className="wrap page">
      <div className="legal-page">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 14 August 2026</p>

        <p>
          This policy explains what information SwapYard collects, why, and how it&apos;s used.
          SwapYard is a private, members-only noticeboard for independent merchant outlets to
          list and request surplus stock — it is not a public consumer service.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Outlet name, county, and contact email (required at registration)</li>
          <li>Contact phone number (optional, if you choose to provide it)</li>
          <li>Content you post: listing titles, descriptions, categories, prices, quantities, and photos; and any requests you post</li>
          <li>Your account password — this is handled by our authentication provider (Supabase) and is never visible to us in plain text</li>
          <li>Basic activity on listings and requests — specifically, when you click &quot;Show contact&quot; on a listing or &quot;I have this&quot; on a request, we record that this happened, tied to your account</li>
          <li>If you enable push notifications, we store a device subscription reference and your chosen category/county preferences, so we know what to notify you about</li>
        </ul>

        <h2>How it&apos;s used</h2>
        <p>
          Your outlet name, county, and contact details are shown alongside listings and requests
          you post, so that other logged-in outlets can get in touch with you directly to arrange
          a deal. We do not use your information for advertising, and we do not sell or share it
          with third parties.
        </p>
        <p>
          Activity data (contact reveals and expressions of interest) is used to help outlets see
          how much interest their own listings and requests are getting, and to help us understand
          which categories and areas are seeing the most activity. It is never sold, shared with
          third parties, or used for advertising.
        </p>

        <h2>Who can see your information</h2>
        <ul>
          <li>Other logged-in outlets on SwapYard can see your outlet name, county, and contact details attached to anything you list or request</li>
          <li>If you list or post a request, you can see activity on that specific listing or request (e.g. how many times contact was revealed) — not who did it individually</li>
          <li>The platform administrator can see all outlet, listing, and activity data, and can take actions such as resetting a password or removing an account if needed</li>
          <li>Nothing on SwapYard is visible to the public internet or search engines — an account is required to view listings, requests, or outlet details</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          SwapYard uses one type of cookie: an essential login/session cookie that keeps you
          signed in. This is separate from the activity data described above, which is stored
          directly in our database, not in a cookie. We do not use tracking, analytics, or
          advertising cookies, and no third-party analytics tools (like Google Analytics) are used
          on SwapYard.
        </p>

        <h2>Where your data is stored</h2>
        <p>
          Data is stored with our database provider, Supabase, in an EU (Ireland) data region.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Your information is kept for as long as your account is active. If you&apos;d like your
          account and associated data removed, contact us using the details below and we&apos;ll
          action it.
        </p>

        <h2>Your rights</h2>
        <p>Under GDPR, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict certain processing</li>
          <li>Request a copy of your data in a portable format</li>
          <li>Lodge a complaint with the Irish Data Protection Commission (dataprotection.ie) if you believe your data has been mishandled</li>
        </ul>

        <h2>Contact</h2>
        <p>
          For any privacy questions or requests, contact us at{' '}
          <a href="mailto:hello@swapyard.ie">hello@swapyard.ie</a>.
        </p>
      </div>
    </div>
  );
}
