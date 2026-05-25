// Template category → locked pages/modules + conditional questions.
// Keyed by the `category` value used in `templates.category` (see templateCategories.ts).

export type ConditionalField =
  | "shipping_regions"
  | "payment_gateway"
  | "tax_setup"
  | "dine_in_takeaway"
  | "menu_type"
  | "reservation_system"
  | "event_date"
  | "venue"
  | "rsvp_limit"
  | "num_authors"
  | "newsletter"
  | "departments"
  | "donation_system"
  | "member_portal";

export interface TemplatePreset {
  pages: string[];
  modules: string[];
  conditionalFields: ConditionalField[];
}

const ECOM: TemplatePreset = {
  pages: ["Home", "Shop", "Product", "Cart", "Checkout", "Wishlist", "Categories", "Account", "Contact"],
  modules: ["Product Filters", "Search", "Reviews", "Coupons", "Order Tracking"],
  conditionalFields: ["shipping_regions", "payment_gateway", "tax_setup"],
};

const INVITE: TemplatePreset = {
  pages: ["Event Details", "RSVP", "Countdown", "Gallery", "Location", "Contact"],
  modules: ["RSVP Form", "Map Embed", "Photo Gallery", "Countdown Timer"],
  conditionalFields: ["event_date", "venue", "rsvp_limit"],
};

const BLOG: TemplatePreset = {
  pages: ["Home", "Articles", "Categories", "Author", "Search", "Featured Posts", "Contact"],
  modules: ["Comments", "Tags", "Social Share", "Newsletter Signup"],
  conditionalFields: ["num_authors", "newsletter"],
};

const ORG: TemplatePreset = {
  pages: ["Home", "About", "Programs", "Donate", "Volunteer", "Events", "Contact"],
  modules: ["Donation Form", "Member Portal", "Event Calendar", "Newsletter"],
  conditionalFields: ["departments", "donation_system", "member_portal"],
};

const PORTFOLIO: TemplatePreset = {
  pages: ["Home", "About", "Work", "Project Detail", "Services", "Contact"],
  modules: ["Project Filters", "Lightbox Gallery", "Contact Form"],
  conditionalFields: [],
};

const BUSINESS: TemplatePreset = {
  pages: ["Home", "About", "Services", "Pricing", "Contact", "Blog"],
  modules: ["Lead Form", "Testimonials", "FAQ", "Map"],
  conditionalFields: [],
};

const MANAGEMENT: TemplatePreset = {
  pages: ["Dashboard", "Users", "Reports", "Settings", "Login"],
  modules: ["Role Permissions", "Data Tables", "Charts", "Export"],
  conditionalFields: [],
};

const SOCIAL: TemplatePreset = {
  pages: ["Home", "Feed", "Profile", "Messages", "Notifications", "Settings"],
  modules: ["User Profiles", "Posts & Comments", "Follow System", "Direct Messages"],
  conditionalFields: [],
};

const EDU: TemplatePreset = {
  pages: ["Home", "Courses", "Course Detail", "Lessons", "Instructors", "Dashboard"],
  modules: ["Enrollment", "Progress Tracking", "Quizzes", "Certificates"],
  conditionalFields: ["num_authors", "newsletter"],
};

const FORMS: TemplatePreset = {
  pages: ["Home", "Form", "Thank You", "Admin"],
  modules: ["Field Builder", "Validation", "Email Notifications", "Submissions Export"],
  conditionalFields: [],
};

const WISHES: TemplatePreset = {
  pages: ["Wish Page", "Gallery", "Share"],
  modules: ["Animated Greeting", "Music", "Photo Slider", "Social Share"],
  conditionalFields: [],
};

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  Ecommerce: ECOM,
  Invite: INVITE,
  "News/Blog": BLOG,
  Organization: ORG,
  Portfolio: PORTFOLIO,
  Business: BUSINESS,
  "Management System": MANAGEMENT,
  Social: SOCIAL,
  Education: EDU,
  Forms: FORMS,
  Wishes: WISHES,
};

// Restaurant lives under Business → Restaurant subcategory
export const SUBCATEGORY_PRESETS: Record<string, Partial<TemplatePreset>> = {
  Restaurant: {
    pages: ["Home", "Menu", "Reservations", "About", "Gallery", "Contact"],
    modules: ["Online Menu", "Reservations", "Order Online"],
    conditionalFields: ["dine_in_takeaway", "menu_type", "reservation_system"],
  },
};

export const getPreset = (category?: string | null, subcategory?: string | null): TemplatePreset => {
  const base = (category && TEMPLATE_PRESETS[category]) || {
    pages: ["Home", "About", "Contact"],
    modules: [],
    conditionalFields: [],
  };
  const sub = subcategory && SUBCATEGORY_PRESETS[subcategory];
  if (!sub) return base;
  return {
    pages: sub.pages ?? base.pages,
    modules: sub.modules ?? base.modules,
    conditionalFields: sub.conditionalFields ?? base.conditionalFields,
  };
};

export const FIELD_LABELS: Record<ConditionalField, string> = {
  shipping_regions: "Shipping regions",
  payment_gateway: "Payment gateway",
  tax_setup: "Tax setup",
  dine_in_takeaway: "Dine-in or takeaway?",
  menu_type: "Menu type",
  reservation_system: "Reservation system",
  event_date: "Event date",
  venue: "Venue",
  rsvp_limit: "RSVP limit",
  num_authors: "Number of authors",
  newsletter: "Newsletter integration",
  departments: "Departments",
  donation_system: "Donation system",
  member_portal: "Member portal",
};

// Map template category -> business_type + project_type so the form auto-fills.
export const CATEGORY_TO_BUSINESS_TYPE: Record<string, string> = {
  Ecommerce: "ecommerce",
  Portfolio: "portfolio",
  Business: "agency",
  "Management System": "saas",
  Organization: "other",
  "News/Blog": "other",
  Social: "other",
  Invite: "other",
  Wishes: "other",
  Forms: "other",
  Education: "other",
};

export const CATEGORY_TO_PROJECT_TYPE: Record<string, string> = {
  Ecommerce: "ecommerce",
  Business: "business",
  Portfolio: "business",
  "Management System": "management",
  Organization: "business",
  "News/Blog": "business",
  Social: "business",
  Invite: "booking",
  Wishes: "business",
  Forms: "business",
  Education: "booking",
};
