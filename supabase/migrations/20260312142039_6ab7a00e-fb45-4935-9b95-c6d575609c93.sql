
-- Seed templates
INSERT INTO public.templates (name, niche, description, features, available_plans, is_active) VALUES
('FashionHub', 'Clothing', 'A sleek, modern storefront for fashion brands with lookbook galleries and size guides.', '["Lookbook gallery", "Size guide widget", "Wishlist", "Color variants", "Instagram feed"]'::jsonb, '["free","rent","buy"]'::jsonb, true),
('ScentLux', 'Perfume', 'Elegant perfume store with fragrance finder, notes breakdown, and gift wrapping options.', '["Fragrance finder quiz", "Scent notes display", "Gift wrapping", "Sample packs", "Subscription box"]'::jsonb, '["rent","buy"]'::jsonb, true),
('GlowBeauty', 'Cosmetics', 'Beauty-first storefront with shade finders, before/after galleries, and tutorial videos.', '["Shade finder", "Before/after gallery", "Video tutorials", "Bundle builder", "Reviews & ratings"]'::jsonb, '["free","rent","buy"]'::jsonb, true),
('SparkleShop', 'Jewelry', 'Luxury jewelry store with 360° product views, custom engraving options, and gift registry.', '["360° product view", "Custom engraving", "Gift registry", "Certificate of authenticity", "Ring size guide"]'::jsonb, '["rent","buy"]'::jsonb, true),
('TechZone', 'Electronics', 'Feature-rich electronics store with comparison charts, spec sheets, and warranty tracking.', '["Product comparison", "Spec sheets", "Warranty tracker", "Tech support chat", "Bulk pricing"]'::jsonb, '["free","rent","buy"]'::jsonb, true),
('SweetBites', 'Bakery', 'Delightful bakery storefront with custom cake builder, dietary filters, and scheduled delivery.', '["Custom cake builder", "Dietary filters", "Scheduled delivery", "Party packs", "Loyalty rewards"]'::jsonb, '["free","rent","buy"]'::jsonb, true),
('DigitalVault', 'Digital', 'Clean digital products store with instant downloads, license keys, and membership access.', '["Instant download", "License key delivery", "Membership tiers", "Preview/demo access", "Usage analytics"]'::jsonb, '["free","rent","buy"]'::jsonb, true);

-- Seed plans
INSERT INTO public.plans (name, type, price_pkr, max_products, max_categories, duration_days, features, is_active) VALUES
('Free Starter', 'free', 0, 5, 2, NULL, '["Basic storefront", "5 products", "2 categories", "Busistree branding"]'::jsonb, true),
('Starter Rent', 'rent', 1500, 25, 5, 30, '["25 products", "5 categories", "Custom domain", "Basic analytics", "Email support"]'::jsonb, true),
('Business Rent', 'rent', 3000, 100, 15, 30, '["100 products", "15 categories", "Custom domain", "Advanced analytics", "Priority support", "No branding"]'::jsonb, true),
('Pro Rent', 'rent', 5000, 500, 30, 30, '["500 products", "30 categories", "Custom domain", "Full analytics", "24/7 support", "No branding", "API access"]'::jsonb, true),
('Basic Buy', 'buy', 10000, 50, 10, NULL, '["50 products", "10 categories", "Custom domain", "Lifetime access", "Basic analytics"]'::jsonb, true),
('Advanced Buy', 'buy', 25000, 200, 20, NULL, '["200 products", "20 categories", "Custom domain", "Lifetime access", "Advanced analytics", "Priority support"]'::jsonb, true),
('Premium Buy', 'buy', 50000, 1000, 50, NULL, '["Unlimited products", "50 categories", "Custom domain", "Lifetime access", "Full analytics", "24/7 support", "API access", "White label"]'::jsonb, true);
