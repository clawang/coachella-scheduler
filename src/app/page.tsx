import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LandingPage from './Landing';
import Link from 'next/link'
import Schedule from './schedule';

export const dynamic = 'force-dynamic'

export default async function Index() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return (
      <Schedule session={session} />
    );
  } else {
    return <LandingPage />
  }
}
