import { redirect } from 'next/navigation';

export default function SettingsApiRedirectPage() {
  redirect('/dashboard/webhooks');
}
