import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '../../../lib/auth';
import KeyValueEditor from '../../../components/admin/KeyValueEditor';

export const dynamic = 'force-dynamic';

const GROUPS = [
  {
    title: 'Hero Section',
    fields: [
      { key: 'hero_subheading', label: 'Hero eyebrow / company name' },
      { key: 'hero_heading', label: 'Hero heading' },
      { key: 'hero_description', label: 'Hero description', type: 'textarea' }
    ]
  },
  {
    title: 'About Section',
    fields: [
      { key: 'about_content', label: 'About MG Solutions', type: 'textarea' },
      { key: 'mission', label: 'Mission', type: 'textarea' },
      { key: 'vision', label: 'Vision', type: 'textarea' }
    ]
  },
  {
    title: 'Company Statistics',
    fields: [
      { key: 'stat_projects', label: 'Projects delivered' },
      { key: 'stat_clients', label: 'Happy clients' },
      { key: 'stat_years', label: 'Years active' },
      { key: 'stat_satisfaction', label: 'Client satisfaction' }
    ]
  },
  {
    title: 'Footer',
    fields: [{ key: 'footer_note', label: 'Footer copyright text', type: 'textarea' }]
  }
];

export default function Page() {
  if (!getSessionFromCookies()) redirect('/admin/login');
  return (
    <KeyValueEditor
      endpoint="/api/admin/content"
      payloadKey="content"
      groups={GROUPS}
      title="Website Content"
      description="Edit the text shown across the public website. Changes appear immediately."
    />
  );
}
