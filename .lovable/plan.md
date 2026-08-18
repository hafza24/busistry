# Admin Invoice & Realtime Fix Plan

## Fix Realtime Errors
- **Correct Subscription Pattern**: Audit and update `useComingSoon.ts`, `useNotifications.ts`, `useCatalog.ts`, `AdminSupportChat.tsx`, `AdminContactMessages.tsx`, and `HelpChat.tsx` to ensure all `.on()` calls precede `.subscribe()`.
- **Lifecycle Management**: Implement `isSubscribed` flags and proper `removeChannel` cleanup in `useEffect` hooks to prevent memory leaks and state updates on unmounted components.

## Admin Invoice Management
- **Schema Implementation**: Ensure `invoices`, `invoice_items`, and related enums are correctly set up in Supabase (manual business vs order source).
- **Invoice Dashboard**:
    - Create `AdminInvoices.tsx` with statistics (Total, Paid, Pending, Overdue).
    - Implement searching (Invoice #, Customer) and filtering (Status, Type).
- **Manual Invoice Creation**:
    - Build `InvoiceFormDialog.tsx` with dynamic line item support.
    - Implement automatic PKR calculations (Subtotal, Discount, Tax, Grand Total).
    - Securely generate unique invoice numbers (e.g., `INV-2026-00001`).
- **Order-Based Generation**:
    - Integrate "Generate Invoice" into `AdminWebsiteOrders.tsx` to pre-populate details from existing order data.
- **Invoice Details & Print**:
    - Build `InvoiceDetailsDialog.tsx` with a professional, A4-friendly layout including Busistree branding and payment instructions.
- **Payment Tracking**:
    - Implement `PaymentRecordDialog.tsx` to log partial/full payments (JazzCash, Easypaisa, Bank Transfer) and auto-update invoice status.

## Security & Integration
- **RLS Policies**: Apply strict Row-Level Security so customers only see their own invoices while admins maintain full access.
- **Service Layer**: route invoice operations through `src/services/admin.ts` for consistent server-side validation.
- **UI Consistency**: Use existing emerald green theme, Shadcn components, and Fraunces/Inter typography.

## Technical Details
- Tables: `invoices`, `invoice_items`, `invoice_payments`.
- Realtime: `postgres_changes` on `invoices` table.
- Hooks: `useInvoices.ts` for data fetching and mutations.
- Calculations: Precision handling for PKR amounts in both frontend and DB.
