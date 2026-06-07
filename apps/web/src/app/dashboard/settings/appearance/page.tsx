import { redirect } from 'next/navigation';

export default function SettingsAppearanceRedirectPage() {
  redirect('/dashboard/theme');
}
