import { redirect } from 'next/navigation';

export default function WidgetsRedirectPage() {
  redirect('/dashboard/widget-editor');
}
