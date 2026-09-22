import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '../../../lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin Login', robots: { index: false } };

export default function LoginPage() {
  if (getSessionFromCookies()) redirect('/admin');
  return <LoginForm />;
}
