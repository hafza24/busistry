
# Busistree SaaS Platform — Implementation Plan

## Phase 1: Foundation & Public Website

### Database Setup (Supabase via Lovable Cloud)
- **profiles** table (name, phone, avatar)
- **user_roles** table (admin, user) with secure role-checking function
- **templates** table (name, niche, description, preview_images, demo_url, features, available_plans)
- **plans** table (name, type: free/rent/buy, price_pkr, max_products, max_categories, duration_days, features)
- **store_requests** table (user_id, store_name, template_id, plan_id, status, payment_method, transaction_id, amount, screenshot_url, created_at)
- **stores** table (user_id, name, subdomain_slug, template_id, plan_id, status, activated_at, expires_at, product_count, category_count)
- **product_packs** table (name, niche, product_count, price_pkr, description)
- **learning_articles** table (title, content, category, video_url)
- Storage bucket for payment screenshots

### Authentication
- Email/password signup & login
- Google OAuth sign-in
- Auto-create profile on signup
- Admin role assigned manually via database

### Public Website Pages
- **Homepage** — Hero section ("Launch Your Online Store in Minutes"), How It Works steps, template showcase, pricing cards, success stories, CTA
- **Browse Templates** — Grid of templates filtered by niche (Clothing, Perfume, Jewelry, Electronics, Bakery, Cosmetics, Digital), each with preview images, features, demo link, and "Launch Store" button
- **Pricing** — Three sections: Free, Rent (Starter/Business/Pro), Buy (Basic/Advanced/Premium) with PKR pricing and feature comparison
- **How It Works** — Step-by-step visual guide
- **Contact** — Contact form
- **Login / Register** — Auth pages

## Phase 2: User Dashboard

### My Stores Section
- List of user's stores with: store name, plan, status badge, expiry date, manage button
- Store request tracking with status pipeline: Pending → Under Review → Approved → Rejected → Activated

### Store Request Flow
1. User picks template → selects plan → enters store name
2. If paid plan: shown payment details (Easypaisa/JazzCash/NayaPay/Raast — Hafza Azam, 03157224340)
3. User fills payment confirmation form: name, email, store name, template, plan, payment method, transaction ID, amount, screenshot upload
4. Request submitted with "Pending" status

### Store Management
- View store details
- Submit renewal payment (for rent plans)
- Request plan upgrade
- Contact support

## Phase 3: Admin Dashboard

### Payment Requests Management
- Table view: user, store name, template, plan, payment method, transaction ID, amount, screenshot preview, status
- Actions: Approve, Reject, Request More Info
- On approval: store status changes to "Activated", expiry date set, user notified

### Store Management
- View all stores with status, plan, expiry
- Suspend/reactivate stores
- Modify product/category limits
- Delete inactive stores

### User Management
- View all registered users
- View user's stores and requests

### Template Management
- Add/edit/delete templates
- Assign niches and available plans

### Plan & Settings Management
- Edit plan pricing, limits, features
- Configure product pack pricing
- Platform-wide settings

## Phase 4: Growth Features

### Product Packs Marketplace
- Browse pre-loaded product packs by niche (Perfume, Cosmetics, Fashion, Bakery)
- Purchase packs as add-ons (Basic 2000 PKR, Premium 5000 PKR)

### Store Setup Assistance
- Paid setup services (Basic 5000 PKR, Advanced 10000 PKR)
- Request form with service selection

### Business Learning Center
- Articles and guides organized by topic: pricing, suppliers, promotion, photography, social media marketing
- Video tutorial embeds

## Design Direction
- Clean, modern SaaS aesthetic
- Brand colors: Green/teal primary (growth/business), white backgrounds
- Mobile-responsive throughout
- PKR currency formatting everywhere
- Urdu-friendly layout considerations (LTR but with Pakistani context)

## Technical Notes
- Store "activation" will update the database record (actual WordPress deployment would be a separate external process)
- Email notifications via Lovable Cloud transactional emails
- File uploads for payment screenshots via Supabase Storage
- RLS policies ensuring users only see their own data, admins see everything
