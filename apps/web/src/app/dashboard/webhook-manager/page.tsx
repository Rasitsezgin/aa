import { redirect } from 'next/navigation';

export default function WebhookManagerRedirectPage() {
  redirect('/dashboard/webhooks');
}
