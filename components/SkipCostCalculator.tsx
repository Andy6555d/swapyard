'use client';

import { useState, useMemo } from 'react';

export default function SkipCostCalculator() {
  const [skipCost, setSkipCost] = useState(350);

  const years = useMemo(() => (skipCost > 0 ? skipCost / 200 : 0), [skipCost]);

  return (
    <div className="skip-calc">
      <p className="skip-calc-label">What did your last skip collection cost?</p>
      <div className="calc-input-euro skip-calc-input">
        <span>€</span>
        <input
          type="number"
          min="0"
          step="10"
          value={skipCost}
          onChange={(e) => setSkipCost(Number(e.target.value) || 0)}
        />
      </div>
      {years > 0 && (
        <p className="skip-calc-result">
          That&apos;s <strong>{years.toFixed(1)} years</strong> of SwapYard membership, for stock
          that could have gone to someone who actually needed it instead.
        </p>
      )}
    </div>
  );
}
