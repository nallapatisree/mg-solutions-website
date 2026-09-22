import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '../../../lib/auth';
import KeyValueEditor from '../../../components/admin/KeyValueEditor';

export const dynamic = 'force-dynamic';

const GROUPS = [
  {
    title: 'Company Information',
    fields: [
      { key: 'company_name', label: 'Company name' },
      { key: 'company_logo', label: 'Company logo', type: 'image' },
      { key: 'favicon', label: 'Favicon', type: 'image' },
      { key: 'address', label: 'Address', type: 'textarea' }
    ]
  },
  {
    title: 'Contact Details',
    fields: [
      { key: 'email', label: 'Email address' },
      { key: 'phone', label: 'Phone number' },
      { key: 'whatsapp', label: 'WhatsApp number', hint: 'Include country code, e.g. +919876543210' }
    ]
  },
  {
    title: 'Social Media',
    fields: [
      { key: 'social_linkedin', label: 'LinkedIn URL' },
      { key: 'social_twitter', label: 'Twitter / X URL' },
      { key: 'social_instagram', label: 'Instagram URL' },
      { key: 'social_facebook', label: 'Facebook URL' }
    ]
  },
  {
    title: 'SEO',
    fields: [
      { key: 'website_title', label: 'Website title' },
      { key: 'seo_description', label: 'Default meta description', type: 'textarea' },
      { key: 'google_analytics_id', label: 'Google Analytics ID', hint: 'e.g. G-XXXXXXXXXX. Leave blank to disable.' }
    ]
  },
  {
    title: 'Maintenance',
    fields: [
      { key: 'maintenance_mode', label: 'Enable maintenance mode', type: 'toggle', hint: 'Public visitors see a maintenance page. Logged-in admins keep full access.' }
    ]
  }
];

export default function Page() {
  if (!getSessionFromCookies()) redirect('/admin/login');
  return (
    <KeyValueEditor
      endpoint="/api/admin/settings"
      payloadKey="settings"
      groups={GROUPS}
      title="Settings & SEO"
      description="Global site configuration, contact details and SEO defaults."
    />
  );
}
