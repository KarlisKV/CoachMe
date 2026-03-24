import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value;

  if (userRole === 'coach') {
    redirect('/onboarding/coach');
  } else if (userRole === 'client') {
    redirect('/onboarding/client');
  } else {
    redirect('/login');
  }
}
