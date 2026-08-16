'use client';

import { useState, useMemo } from 'react';
import { CATEGORY_GROUPS, UNGROUPED_CATEGORIES, COUNTIES } from '@/lib/constants';
import ContactReveal from '@/components/ContactReveal';

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
  preferred_contact: string;
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
            {CATEGORY_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
            {UNGROUPED_CATEGORIES.map((c) => (
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
              <div className={`tag ${item.status !== 'active' ? 'sold' : ''}`}>
                €{Number(item.price).toLocaleString()}
              </div>
              <a href={`/listings/${item.id}`} className="card-link-area">
                <div className="card-media">
                  {item.status !== 'active' && (
                    <div className={`status-stamp ${item.status}`}>
                      {item.status === 'reserved' ? 'RESERVED' : 'SOLD'}
                    </div>
                  )}
                  {item.image_urls?.[0] ? (
                    <img src={item.image_urls[0]} alt={item.title} loading="lazy" />
                  ) : (
                    <span className="placeholder">{item.category}</span>
                  )}
                  {item.image_urls?.length > 1 && (
                    <span className="photo-count">+{item.image_urls.length - 1} more</span>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-cat">{item.category}</div>
                  <p className="card-title">{item.title}</p>
                  <p className="card-desc">{item.description}</p>
                  {item.quantity && <p className="card-meta">Quantity: {item.quantity}</p>}
                </div>
              </a>
              <div className="card-body" style={{ paddingTop: 0 }}>
                <div className="card-foot">
                  <span className="stamp">{item.outlet_name} · {item.county}</span>
                  <ContactReveal
                    email={item.contact_email}
                    phone={item.contact_phone}
                    preferredContact={item.preferred_contact}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
