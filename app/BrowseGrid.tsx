'use client';

import { useState, useMemo } from 'react';
import { CATEGORIES, COUNTIES } from '@/lib/constants';

type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  county: string;
  quantity: string | null;
  price: number;
  image_urls: string[];
  status: string;
  outlet_name: string;
  contact_email: string;
  contact_phone: string | null;
};

export default function BrowseGrid({ listings }: { listings: Listing[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter((item) => {
      const matchesQ =
        !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      const matchesCat = !category || item.category === category;
      const matchesCounty = !county || item.county === county;
      return matchesQ && matchesCat && matchesCounty;
    });
  }, [listings, search, category, county]);

  return (
    <>
      <div className="filterbar">
        <div className="filter-row">
          <input
            type="search"
            placeholder="Search stock — e.g. insulation, radiators, block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">All counties</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">NO MATCHING STOCK — try clearing a filter or check back later.</div>
      ) : (
        <div className="grid">
          {filtered.map((item) => (
            <div className="card" key={item.id}>
              <div className={`tag ${item.status === 'sold' ? 'sold' : ''}`}>
                {item.status === 'sold' ? 'SOLD' : `€${Number(item.price).toLocaleString()}`}
              </div>
              <div className="card-media">
                {item.image_urls?.[0] ? (
                  <img src={item.image_urls[0]} alt={item.title} />
                ) : (
                  <span className="placeholder">{item.category}</span>
                )}
              </div>
              <div className="card-body">
                <div className="card-cat">{item.category}</div>
                <p className="card-title">{item.title}</p>
                <p className="card-desc">{item.description}</p>
                {item.quantity && <p className="card-meta">Quantity: {item.quantity}</p>}
                <div className="card-foot">
                  <span className="stamp">{item.outlet_name} · {item.county}</span>
                  <a className="contact-link" href={`mailto:${item.contact_email}`}>
                    Contact outlet →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
