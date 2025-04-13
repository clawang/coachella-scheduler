"use server"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Profile from './profile'

export default async function Page() {
    const supabase = createServerComponentClient({ cookies })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session) {
        return <Profile session={session} />
    }

    return <p>There was an error.</p>
}