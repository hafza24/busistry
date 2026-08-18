# Plan: Admin Dashboard Fix

The Admin Dashboard is currently experiencing a runtime error because the `AdminOverview` component attempts to query the `updated_at` column on the `stores` table, which does not exist in the database.

## Technical Details

- **Root Cause**: `AdminOverview.tsx` uses `.select("..., updated_at, ...").order("updated_at")` on the `stores` table.
- **Database State**: `information_schema` confirms `updated_at` is missing from `public.stores`.
- **Symptoms**: `AdminOverview` fails to load "Recent Orders", likely showing a blank or error state.

## Implementation Steps

### 1. Database Migration
- Add `updated_at` column to `public.stores`.
- Attach the standard `handle_updated_at()` trigger to maintain it.

### 2. Code Verification
- Once the migration is applied, the existing code in `AdminOverview.tsx` and `AdminDashboard.tsx` will function correctly as it already expects this column to exist.

## Verification Plan

- Check `supabase--analytics_query` to ensure no new "column does not exist" errors appear.
- Verify the Admin Dashboard "Overview" tab loads correctly.
