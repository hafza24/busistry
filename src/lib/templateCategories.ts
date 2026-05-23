export const TEMPLATE_CATEGORIES: Record<string, string[]> = {
  "Organization": ["Non-Profit", "NGO", "Charity", "Religious", "Community", "Government"],
  "Ecommerce": ["Fashion", "Electronics", "Grocery", "Beauty", "Furniture", "Jewelry", "Handmade", "Multi-vendor"],
  "Portfolio": ["Designer", "Developer", "Photographer", "Artist", "Writer", "Architect", "Model"],
  "Management System": ["CRM", "Inventory", "School", "Hospital", "HR", "Restaurant POS", "Booking", "Project Management"],
  "News/Blog": ["News Portal", "Personal Blog", "Magazine", "Tech Blog", "Lifestyle", "Sports"],
  "Social": ["Community", "Forum", "Dating", "Networking", "Marketplace"],
  "Invite": ["Wedding", "Birthday", "Corporate Event", "Conference", "Party"],
  "Wishes": ["Birthday", "Anniversary", "Eid", "Christmas", "New Year", "Valentine"],
  "Forms": ["Survey", "Application", "Registration", "Feedback", "Contact", "Booking Form"],
  "Business": ["Agency", "Consulting", "Real Estate", "Law Firm", "Clinic", "Salon", "Gym"],
  "Education": ["LMS", "Course", "Coaching", "Tutoring", "University"],
};

export const TEMPLATE_CATEGORY_NAMES = Object.keys(TEMPLATE_CATEGORIES);
