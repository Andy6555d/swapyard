export const dynamic = 'force-dynamic';

const FAQS = [
  {
    q: 'What if nobody\u2019s in my area yet?',
    a: 'You\u2019re not limited to only your own county \u2014 browsing and searching cover the whole country, county filtering just narrows it down when you want it to. SwapYard is also growing member by member, and joining early means your listings get seen by everyone who joins after you too.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. The Billing page takes you straight to a self-serve billing portal where you can cancel yourself \u2014 no need to email or ask permission. Access continues until the end of the period you\u2019ve already paid for.',
  },
  {
    q: 'Who actually runs SwapYard?',
    a: 'SwapYard is built and run independently, not by a large company. That means real, direct support if something goes wrong \u2014 not a ticket queue.',
  },
  {
    q: 'Is my contact info public?',
    a: 'No. Your email and phone are never visible on the public internet or to search engines. Other logged-in, paying members have to actively click \u201cShow contact\u201d to see them \u2014 nothing is displayed openly.',
  },
  {
    q: 'Does SwapYard take a commission?',
    a: 'No, zero, ever. Your membership fee is the only cost. Whatever price you agree with the other outlet, you keep every cent of it.',
  },
  {
    q: 'How do deals actually work?',
    a: 'You contact each other directly \u2014 email or phone \u2014 and agree price, condition, and delivery yourselves. SwapYard is a noticeboard that connects you; it\u2019s never a party to the deal itself.',
  },
  {
    q: 'What happens to my listings if I stop paying?',
    a: 'Nothing is deleted. Access pauses until you resubscribe, but everything you\u2019ve listed is right where you left it if you come back.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes, fully. It\u2019s built mobile-first and works in any phone browser \u2014 no app to download.',
  },
  {
    q: 'What if there\u2019s a problem with another outlet?',
    a: 'Since deals happen directly between outlets, SwapYard isn\u2019t able to resolve individual disputes \u2014 same as agreeing anything directly with another business. If you believe an account is being misused, let us know at hello@swapyard.ie and we\u2019ll look into it.',
  },
];

export default function FaqPage() {
  return (
    <div className="wrap page">
      <div className="legal-page">
        <h1>Frequently Asked Questions</h1>
        <p className="legal-updated">Everything worth knowing before you join</p>

        <div className="faq-list">
          {FAQS.map((item, i) => (
            <details className="faq-item" key={i}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="legal-note" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ flex: 1, minWidth: '220px' }}>
            Something else on your mind? Just ask directly.
          </span>
          <a href="mailto:hello@swapyard.ie" className="btn btn-secondary btn-sm">Email us</a>
          <a href="/signup" className="btn btn-primary btn-sm">Register Your Outlet</a>
        </div>
      </div>
    </div>
  );
}
