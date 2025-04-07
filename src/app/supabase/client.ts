import { createClientComponentClient, Session, SupabaseClient, User as SupabaseUser } from '@supabase/auth-helpers-nextjs';
import { Act, User, RELATIONSHIP_STATUS } from '../types';
import { dateToSlug } from '../utils';
import { AuthChangeEvent } from '@supabase/supabase-js';

export class Supabase {
    client: SupabaseClient;

    constructor(client: SupabaseClient) {
        this.client = client;
    }

    async signIn(email: string, password: string) {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    }

    async signUp(email: string, password: string, username: string) {
        const { data, error } = await this.client.auth.signUp(
            {
                email,
                password,
                options: {
                    data: {
                        display_name: username,
                    }
                },
            });
        if (data?.user) {
            console.log(data.user);
            this.addUser(data.user);
        }
        return { data, error };
    }

    async addUser(authData: SupabaseUser) {
        const { data, error } = await this.client.from('users').upsert({
            id: authData.id,
            username: authData.user_metadata.display_name,
            email: authData.user_metadata.email
        }).select();
    }

    async isUsernameUnique(username: string): Promise<boolean> {
        let { data, error, status } = await this.client
            .from('users')
            .select(`username`)
            .eq('username', username);

        if (error) return false;
        return data!.length <= 0;
    }

    async signOut() {
        await this.client.auth.signOut();
    }

    async setUsername(username: string): Promise<{ data, error }> {
        const session = await this.getSession();
        const { data, error } = await this.client.from('users').upsert({
            user_id: session!.user?.id,
            username,
            email: session!.user?.email
        }).select();

        return { data, error };
    }

    async getSession(): Promise<Session | null> {
        const {
            data: { session },
        } = await this.client.auth.getSession();
        return session;
    }

    async getUser(uuid: string): Promise<User> {
        const { data, error } = await this.client.from('users').select()
            .eq('id', uuid);
        return data?.[0];
    }

    async getUserFromSession(session: Session): Promise<User | null> {
        const uuid = session?.user?.id;
        if (uuid) {
            const user = await this.getUser(uuid);
            return user;
        }
        return null;
    }

    async getCurrentUserData(): Promise<User | null> {
        const session = await this.getSession();
        if (session) {
            return await this.getUserFromSession(session);
        }
        return null;
    }

    onAuthStateChange(func: (event: AuthChangeEvent, session: Session) => void) {
        this.client.auth.onAuthStateChange((event, session) => {
            if (session) {
                func(event, session);
            }
        });
    }

    async joinUserAct(user_id: string, act_id: number): Promise<{ data, error }> {
        const { data, error } = await this.client.from('acts_users')
            .upsert({
                user_id,
                act_id,
            })
            .select();

        return { data, error };
    }

    async unjoinUserAct(user_id: string, act_id: number): Promise<{ data, error }> {
        const { data, error } = await this.client.from('acts_users')
            .delete()
            .match({ user_id, act_id });

        return { data, error };
    }

    async searchUsersByUsername(query: string): Promise<{ data, error }> {
        const { data, error } = await this.client
            .from('users')
            .select(`
                id,
                username,
                profilePic
            `)
            .ilike('username', '%' + query + '%');

        return { data, error };
    }

    async fetchRelationships(user_id: string): Promise<{ data, error }> {
        const { data, error } = await this.client
            .from('user_relationships')
            .select(`
                status,
                friend:second_id ( id, username, profilePic )
            `)
            .eq('first_id', user_id);

        return { data, error };
    }

    async searchEvent(query: string): Promise<{ data, error }> {
        const { data, error } = await this.client
            .from('events')
            .select(`
                id,
                name,
                date,
                venues ( id, name )
            `)
            .ilike('name', '%' + query + '%');

        return { data, error };
    }

    async getUserData(id: string): Promise<{ data, error }> {
        let { data, error, status } = await this.client
            .from('users')
            .select(`username, email, profilePic`)
            .eq('id', id)
            .single();

        return { data, error };
    }

    async getRelationship(second_id: string) {
        const session = await this.getSession();
        const first_id = session?.user?.id;
        const { data, error } = await this.client.from('user_relationships').select('status')
            .match({ first_id: first_id, second_id: second_id });

        return { data, error };
    }

    async sendFriendRequest(sendee_id: string) {
        const session = await this.getSession();
        const sender_id = session?.user?.id;
        const { data, error } = await this.client.from('user_relationships').upsert([
            { first_id: sender_id, second_id: sendee_id, status: RELATIONSHIP_STATUS.REQUESTER },
            { first_id: sendee_id, second_id: sender_id, status: RELATIONSHIP_STATUS.REQUESTEE },
        ]).select();

        return { data, error };
    }

    async removeFriend(sendee_id: string) {
        const session = await this.getSession();
        const sender_id = session?.user?.id;
        const { data, error } = await this.client.from('user_relationships')
            .delete()
            .or(`and(first_id.eq.${sender_id},second_id.eq.${sendee_id}),and(first_id.eq.${sendee_id},second_id.eq.${sender_id})`);

        return { data, error };
    }

    async acceptRequest(sendee_id: string) {
        console.log(sendee_id);
        const session = await this.getSession();
        const sender_id = session?.user?.id;
        const { data, error } = await this.client.from('user_relationships')
            .update({ status: 3 })
            .or(`and(first_id.eq.${sender_id},second_id.eq.${sendee_id}),and(first_id.eq.${sendee_id},second_id.eq.${sender_id})`)
            .select();

        console.log(data);
        console.log(error);

        return { data, error };
    }

    async fetchProfile(user_id: string) {
        const { data, error } = await this.client
            .from('users')
            .select(`
                id,
                acts ( id, name, date, startTime, endTime, stage )
            `)
            .eq('id', user_id);

        //user_relationships!user_relationships_first_id_fkey ( status, users!user_relationships_second_id_fkey (username, profilePic) )

        return { data, error };
    }

    async fetchProfileFromUsername(username: string) {
        const { data, error } = await this.client
            .from('users')
            .select(`
                user_id,
                profile_image,
                acts ( id, name, date, startTime, endTime, stage ),
                user_relationships!user_relationships_first_id_fkey ( status, users!user_relationships_second_id_fkey (username, profile_image) )
            `)
            .eq('username', username);

        return { data, error };
    }

    async fetchFriends(user_id: string): Promise<{ data, error }> {
        const { data, error } = await this.client
            .from('user_relationships')
            .select(`
                status,
                friend:second_id ( id, username, profilePic )
            `)
            .match({ first_id: user_id, status: 3 });

        return { data, error };
    }

    async fetchFriendsActs() {
        const session = await this.getSession();
        if (session?.user.id) {
            const friendsObj = await this.fetchFriends(session?.user.id);
            if (friendsObj.data) {
                const friendIds = friendsObj.data.map(friend => friend.friend.id);
                const { data, error } = await this.client
                    .from('acts_users')
                    .select(`
                        act:act_id ( id ),
                        friend:user_id ( id, username, profilePic )
                    `)
                    .in('user_id', friendIds);

                return { data, error };
            }
            return friendsObj;
        }
        return { error: { message: "no session id found" } };
    }

    async fetchAct(slug: string) {
        const { data, error } = await this.client
            .from('acts')
            .select(`
                id,
                name,
                date,
                startTime,
                endTime,
                stage,
                users ( id, username )
            `)
            .eq('slug', slug);

        return { data, error };
    }

    // async fetchActs() {
    //     const session = await this.getSession();
    //     const { data, error } = await this.client
    //         .from('acts')
    //         .select(`
    //             id,
    //             name,
    //             date,
    //             startTime,
    //             endTime,
    //             stage,
    //             acts_users ( users (id, username) )
    //         `)
    //         .eq('acts_users.user_a.user_id!user_relationships_second_id_fkey', session!.user.id)
    //         .neq('user_id', session!.user.id);

    //     return { data, error };
    // }

    async fetchActs() {
        const { data, error } = await this.client
            .from('acts')
            .select(`
                id,
                name,
                date,
                startTime,
                endTime,
                stage
            `);

        return { data, error };
    }

    async fetchFeed() {
        const session = await this.getSession();
        console.log(session?.user.id);
        const { data, error } = await this.client
            .from('users_events')
            .select(`
                created_at,
                status,
                rating,
                review,
                user_id ( username, first_name, profile_image ),
                users ( username ),
                events (name, date, image_url, slug, venues (name))
            `)
            .eq('users.user_id!user_relationships_second_id_fkey', session!.user.id)
            .neq('user_id', session!.user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    }
}