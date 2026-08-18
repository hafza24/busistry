# Plan: Invoice System Implementation

Create a comprehensive invoice system including PDF generation with branding, signature, and an admin interface for manual invoice creation.

## Proposed Changes

### Database Schema
- Create `invoices` table:
    - `id` (UUID, PK)
    - `invoice_number` (String, Unique)
    - `customer_id` (UUID, References profiles)
    - `customer_name` (String) - For walk-in or override
    - `customer_email` (String)
    - `customer_phone` (String)
    - `customer_address` (Text)
    - `status` (Enum: pending, paid, cancelled)
    - `issue_date` (Date)
    - `due_date` (Date)
    - `total_amount` (Decimal)
    - `currency` (String, Default 'PKR')
    - `notes` (Text)
    - `created_at` (Timestamp)
- Create `invoice_items` table:
    - `id` (UUID, PK)
    - `invoice_id` (UUID, References invoices)
    - `description` (String)
    - `quantity` (Integer)
    - `unit_price` (Decimal)
    - `amount` (Decimal)

### Branding & Assets
- Use project logo (Blogo_Green.png).
- Process and use the uploaded CEO signature image.

### Components & Pages
- `src/components/admin/AdminInvoices.tsx`: Dashboard to list, search, and manage invoices.
- `src/components/admin/CreateInvoiceDialog.tsx`: Form for manual invoice creation (walk-in customers).
- `src/components/admin/InvoicePDFPreview.tsx`: Preview of the generated invoice.
- `src/pages/AdminInvoicesPage.tsx`: Admin route for invoice management.

### Technical Details
- Use `jspdf` and `jspdf-autotable` for PDF generation on the client-side.
- Ensure RLS policies allow admins full access and users to view only their own invoices.
- Implement a helper to generate unique invoice numbers (e.g., INV-2026-0001).

## Verification Plan
- Verify database migrations run successfully.
- Test manual invoice creation with various inputs.
- Verify PDF generation: logo, signature, and table layout.
- Check RLS security: regular users cannot access the admin invoice list.
