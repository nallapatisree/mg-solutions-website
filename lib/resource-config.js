// Shared, client-safe resource definitions.
// Drives BOTH the generic admin CRUD UI and the generic admin API routes,
// so adding a new managed entity means adding one entry here + one DB table.

export const SERVICE_CATEGORIES = [];

export const PROJECT_STATUSES = ['Upcoming', 'In Development', 'Completed', 'Live'];

export const ANNOUNCEMENT_CATEGORIES = [
  'New Project Launch',
  'New Service Launch',
  'Company Announcement',
  'Hiring Update',
  'Event',
  'Important Notice',
  'Achievement',
  'Partnership Update'
];

export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Follow Up', 'Converted', 'Closed'];

export const BUDGET_RANGES = [
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000 – ₹5,00,000',
  'Above ₹5,00,000',
  'Not sure yet'
];

// field types: text | textarea | number | select | checkbox | date | image | tags
export const RESOURCES = {
  services: {
    label: 'Services',
    singular: 'Service',
    table: 'services',
    titleField: 'name',
    slugFrom: 'name',
    defaultSort: 'display_order ASC',
    listColumns: ['name', 'display_order', 'is_published'],
    fields: [
      { name: 'name', label: 'Service name', type: 'text', required: true },
      { name: 'slug', label: 'Slug (auto-generated if blank)', type: 'text' },
      { name: 'icon_url', label: 'Icon / image', type: 'image' },
      { name: 'image_alt', label: 'Image alt text', type: 'text' },
      { name: 'short_description', label: 'Short description', type: 'textarea', required: true },
      { name: 'detailed_description', label: 'Detailed description', type: 'textarea' },
      { name: 'display_order', label: 'Display order', type: 'number', default: 0 },
      { name: 'is_published', label: 'Published (visible on website)', type: 'checkbox', default: 1 },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' }
    ]
  },

  projects: {
    label: 'Projects',
    singular: 'Project',
    table: 'projects',
    titleField: 'name',
    slugFrom: 'name',
    defaultSort: 'display_order ASC',
    listColumns: ['name', 'status', 'is_featured', 'is_published'],
    fields: [
      { name: 'name', label: 'Project name', type: 'text', required: true },
      { name: 'slug', label: 'Slug (auto-generated if blank)', type: 'text' },
      { name: 'thumbnail_url', label: 'Thumbnail', type: 'image' },
      { name: 'short_description', label: 'Short description', type: 'textarea', required: true },
      { name: 'detailed_description', label: 'Detailed description', type: 'textarea' },
      { name: 'client_name', label: 'Client name', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'technologies', label: 'Technologies (comma separated)', type: 'tags' },
      { name: 'project_url', label: 'Project / demo URL', type: 'text' },
      { name: 'completion_date', label: 'Completion date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, default: 'In Development' },
      { name: 'is_featured', label: 'Featured project', type: 'checkbox', default: 0 },
      { name: 'is_published', label: 'Published (visible on website)', type: 'checkbox', default: 1 },
      { name: 'display_order', label: 'Display order', type: 'number', default: 0 },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' }
    ],
    hasScreenshots: true
  },

  announcements: {
    label: 'Announcements',
    singular: 'Announcement',
    table: 'announcements',
    titleField: 'title',
    slugFrom: 'title',
    defaultSort: 'is_pinned DESC, announcement_date DESC',
    listColumns: ['title', 'category', 'announcement_date', 'is_published'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug (auto-generated if blank)', type: 'text' },
      { name: 'image_url', label: 'Image', type: 'image' },
      { name: 'image_alt', label: 'Image alt text', type: 'text' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'announcement_date', label: 'Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'select', options: ANNOUNCEMENT_CATEGORIES, default: 'Company Announcement' },
      { name: 'is_published', label: 'Published', type: 'checkbox', default: 1 },
      { name: 'is_pinned', label: 'Pinned to top', type: 'checkbox', default: 0 },
      { name: 'is_featured', label: 'Featured', type: 'checkbox', default: 0 },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' }
    ]
  },

  testimonials: {
    label: 'Testimonials',
    singular: 'Testimonial',
    table: 'testimonials',
    titleField: 'client_name',
    defaultSort: "CASE approval_status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC",
    listColumns: ['client_name', 'company_name', 'rating', 'approval_status'],
    fields: [
      { name: 'client_name', label: 'Client name', type: 'text', required: true },
      { name: 'company_name', label: 'Company / business name', type: 'text' },
      { name: 'image_url', label: 'Profile image / company logo', type: 'image' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', default: 5, min: 1, max: 5 },
      { name: 'feedback', label: 'Feedback text', type: 'textarea', required: true },
      { name: 'service_taken', label: 'Project / service taken', type: 'text' },
      { name: 'approval_status', label: 'Approval status', type: 'select', options: ['pending', 'approved', 'rejected'], default: 'pending' },
      { name: 'is_featured', label: 'Featured testimonial', type: 'checkbox', default: 0 },
      { name: 'is_visible', label: 'Visible', type: 'checkbox', default: 1 }
    ]
  },

  enquiries: {
    label: 'Enquiries',
    singular: 'Enquiry',
    table: 'enquiries',
    titleField: 'name',
    defaultSort: 'created_at DESC',
    listColumns: ['name', 'email', 'service_requested', 'status', 'created_at'],
    // Enquiries are created by the public form; admins update status/notes only.
    adminCreate: false,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'company_name', label: 'Company', type: 'text' },
      { name: 'service_requested', label: 'Service requested', type: 'text' },
      { name: 'budget_range', label: 'Budget range', type: 'text' },
      { name: 'project_description', label: 'Project description', type: 'textarea' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ENQUIRY_STATUSES, default: 'New' },
      { name: 'internal_notes', label: 'Private internal notes (never shown publicly)', type: 'textarea' }
    ]
  }
};

export function getResource(key) {
  return RESOURCES[key];
}
