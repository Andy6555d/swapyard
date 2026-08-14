import { createListing } from '../actions';
import { CATEGORY_GROUPS, UNGROUPED_CATEGORIES, COUNTIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';

export default async function ListStockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultCounty = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('county')
      .eq('id', user.id)
      .single();
    defaultCounty = profile?.county ?? '';
  }

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>List Surplus Stock</h1>
        <span className="sub">TAKES ~2 MINUTES</span>
      </div>
      {params.error && <div className="error-box">{params.error}</div>}
      <div style={{ maxWidth: 560 }}>
        <form action={createListing}>
          <div className="field">
            <label htmlFor="title">Item title</label>
            <input type="text" id="title" name="title" placeholder="e.g. Class B engineering bricks, 400 units" required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" placeholder="Condition, why it's surplus, collection notes..." required />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required defaultValue="">
                <option value="" disabled>Select category</option>
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
            </div>
            <div className="field">
              <label htmlFor="county">County</label>
              <select id="county" name="county" required defaultValue={defaultCounty}>
                <option value="" disabled>Select county</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input type="text" id="quantity" name="quantity" placeholder="e.g. 400 units, 22m²" />
            </div>
            <div className="field price-field">
              <label htmlFor="price">Asking price</label>
              <span>€</span>
              <input type="number" id="price" name="price" min="0" step="0.01" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="images">Photos (up to 6)</label>
            <div className="file-field">
              Select up to 6 photos of the stock
              <input type="file" id="images" name="images" accept="image/*" multiple />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Publish Listing
          </button>
        </form>
      </div>
    </div>
  );
}
