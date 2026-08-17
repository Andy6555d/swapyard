'use client';

import { useState, useMemo } from 'react';

function formatWithCommas(n: number): string {
  return n.toLocaleString('en-IE');
}

export default function AgedStockCalculator() {
  const [stockholding, setStockholding] = useState(750000);
  const [stockholdingDisplay, setStockholdingDisplay] = useState('750,000.00');
  const [percentage, setPercentage] = useState(8);

  const agedValue = useMemo(() => stockholding * (percentage / 100), [stockholding, percentage]);
  const multiplier = useMemo(() => {
    const recoveryValue = agedValue * 0.01;
    return recoveryValue > 0 ? recoveryValue / 200 : 0;
  }, [agedValue]);

  const formatEuro = (n: number) =>
    `€${Math.round(n).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function handleStockholdingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    setStockholding(num);
    setStockholdingDisplay(raw === '' ? '' : formatWithCommas(num));
  }

  function handleStockholdingFocus() {
    setStockholdingDisplay(stockholding === 0 ? '' : formatWithCommas(stockholding));
  }

  function handleStockholdingBlur() {
    setStockholdingDisplay(
      stockholding === 0
        ? '0.00'
        : `${formatWithCommas(stockholding)}.00`
    );
  }

  return (
    <section className="calc-section">
      <div className="wrap">
        <div className="calc-card">
          <h2>What&apos;s your aged stock actually costing you?</h2>

          <div className="calc-inputs">
            <div className="calc-field">
              <label htmlFor="calc-stockholding">What&apos;s your approximate stockholding?</label>
              <div className="calc-input-euro">
                <span>€</span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="calc-stockholding"
                  value={stockholdingDisplay}
                  onChange={handleStockholdingChange}
                  onFocus={handleStockholdingFocus}
                  onBlur={handleStockholdingBlur}
                />
              </div>
            </div>
            <div className="calc-field">
              <label htmlFor="calc-percentage">Approximately what percentage is aged / slow moving?</label>
              <div className="calc-slider-row">
                <input
                  type="range"
                  id="calc-percentage"
                  min="0"
                  max="30"
                  step="1"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                />
                <span className="calc-slider-value">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className="calc-result">
            <p className="calc-result-line">You could have approximately</p>
            <p className="calc-result-figure">{formatEuro(agedValue)}</p>
            <p className="calc-result-line">tied up in aged stock.</p>

            <div className="calc-divider" />

            <div className="calc-compare-row">
              <span>SwapYard membership</span>
              <span>€200.00/year</span>
            </div>
            {multiplier > 0 && (
              <p className="calc-multiplier">
                Recovering just <strong>1%</strong> of that aged stock would equal{' '}
                <strong>{multiplier.toFixed(1)}×</strong> the annual membership cost.
              </p>
            )}

            <a href="/signup" className="btn btn-primary">Start moving it →</a>
            <a href="/aged-stock-guide" className="calc-guide-link">What counts as aged stock? →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
