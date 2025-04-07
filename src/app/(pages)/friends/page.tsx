"use server"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import FriendsPage from './friends'

export default async function Page() {
    const supabase = createServerComponentClient({ cookies })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session) {
        return <FriendsPage session={session} />
    }

    return <p>There was an error.</p>
}