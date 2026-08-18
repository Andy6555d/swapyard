-- ============================================================
-- SwapYard, outcome tracking
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================
-- Why: right now SwapYard can only report activity (contact
-- reveals, expressions of interest), not actual confirmed
-- outcomes. This adds a simple yes/no captured at the moment
-- someone marks a listing sold or a request fulfilled, so real
-- stock value moved through SwapYard can eventually be reported.

alter table listings add column sold_via_swapyard boolean;
alter table requests add column fulfilled_via_swapyard boolean;
