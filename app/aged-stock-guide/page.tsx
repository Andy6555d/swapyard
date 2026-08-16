import SkipCostCalculator from '@/components/SkipCostCalculator';

export const dynamic = 'force-dynamic';

export default function AgedStockGuidePage() {
  return (
    <div className="wrap page">
      <div className="legal-page">
        <h1>Understanding Aged Stock</h1>
        <p className="legal-updated">A practical guide, not a lecture</p>

        <h2>What actually counts as &quot;aged stock&quot;?</h2>
        <p>
          Not every slow item is a problem. Aged stock is specifically anything that&apos;s sat
          on the shelf or in the yard well past the point where you&apos;d normally expect it to
          move, tying up money and space with no real sign it&apos;s going anywhere. It usually
          gets there one of a few ways: over-ordered for a job that changed spec, left over when
          a range got discontinued, bought in for a project that fell through, or just quietly
          outlived its usual demand.
        </p>

        <h2>Why it&apos;s worth taking seriously</h2>
        <ul>
          <li><strong>It&apos;s cash, not stock.</strong> Every euro sitting in aged stock is a euro you already spent that isn&apos;t doing anything for you.</li>
          <li><strong>It costs you space you&apos;re paying for</strong>, whether that&apos;s yard room or shelf room that could hold something that actually sells.</li>
          <li><strong>It&apos;s a write-off waiting to happen.</strong> Most aged stock doesn&apos;t get sold eventually, it gets skipped, and that cost often doesn&apos;t show up clearly until it&apos;s too late to do anything about it.</li>
          <li><strong>It&apos;s easy to lose track of.</strong> Without a rough system, aged stock hides in plain sight between the stuff that&apos;s actually moving.</li>
        </ul>

        <h2>A simple way to check your own yard</h2>
        <p>
          You don&apos;t need a stock system or a spreadsheet to get a rough sense of this.
          Walk the yard and shelves with one question in mind: <em>&quot;when did this last move,
          and would I reorder it today?&quot;</em> Anything you can&apos;t answer confidently is
          worth a second look.
        </p>
        <p>
          If you want a slightly more structured version, sort what you find into three rough
          buckets:
        </p>
        <ul>
          <li><strong>Under 3 months</strong> — normal. Not a concern yet.</li>
          <li><strong>3 to 6 months</strong> — worth watching. Ask why it hasn&apos;t moved.</li>
          <li><strong>6 months or more</strong> — worth acting on. This is where real money is sitting idle.</li>
        </ul>

        <h2>Quick ways to reduce it</h2>
        <ul>
          <li><strong>Do a proper walk-around every few months</strong>, not just when someone trips over it.</li>
          <li><strong>Be honest about &quot;just in case&quot; ordering.</strong> Stock bought for a maybe-job is where a lot of aging starts.</li>
          <li><strong>Act before it&apos;s fully dead.</strong> Something at 4 months is far easier to move than the same item at 14 months.</li>
          <li><strong>Don&apos;t let it become a write-off by default.</strong> A skip is the last resort, not the automatic one, if there&apos;s any real chance someone else could use it.</li>
        </ul>

        <h2>Where SwapYard fits in</h2>
        <p>
          This is exactly the gap SwapYard exists to close. Instead of aged stock sitting there
          until it&apos;s eventually skipped, it goes in front of other independent merchants who
          might genuinely need it. No commission, no middleman, you set the price and deal with
          the buyer directly.
        </p>

        <SkipCostCalculator />

        <div className="legal-note" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ flex: 1, minWidth: '220px' }}>
            Want to see roughly what your own aged stock could be worth? Try the calculator on the homepage.
          </span>
          <a href="/#top" className="btn btn-secondary btn-sm">Try the Calculator</a>
          <a href="/signup" className="btn btn-primary btn-sm">Register Your Outlet</a>
        </div>
      </div>
    </div>
  );
}
