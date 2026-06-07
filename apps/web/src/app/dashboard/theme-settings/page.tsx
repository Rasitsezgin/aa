import { redirect } from 'next/navigation';

export default function ThemeSettingsRedirectPage() {
  redirect('/dashboard/theme');
}
