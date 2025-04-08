'use client'
import React, { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Supabase } from '../../supabase/client';
import { Session } from '@supabase/supabase-js'
import { Button } from '@/app/components/button';
import { User, RELATIONSHIP_STATUS } from '@/app/types';
import './style.scss';

export default function FriendsPage({ session }: { session: Session }) {
    const [friends, setFriends] = useState<User[] | null>(null);
    const [requests, setRequests] = useState<User[] | null>(null);
    const [searchUsername, setUsername] = useState('');
    const [searchResults, setResults] = useState<User[] | null>([]);
    const supabase = new Supabase(createClientComponentClient());

    useEffect(() => {
        if (session?.user.id) {
            fetchFriends();
        }
    }, []);

    const fetchFriends = async () => {
        const { data, error } = await supabase.fetchRelationships(session.user.id);
        if (data) {
            const mappedData = data.map((item: { friend: User, status: number }) => (
                { ...item.friend, status: item.status }
            ));
            setFriends(mappedData);
            setRequests(mappedData.filter((friend: User) => friend.status === RELATIONSHIP_STATUS.REQUESTEE));
        }
    }

    const searchFriends = async () => {
        const { data, error } = await supabase.searchUsersByUsername(searchUsername);
        console.log(data);
        if (data) {
            setResults(data);
        }
    }

    return (
        <div className="friends-wrapper">
            <div className="add-friend">
                <label>Add friend by username</label>
                <div className="search-bar">
                    <input type="text" value={searchUsername} onChange={e => setUsername(e.target.value)} />
                    <img src="/icon-search.svg" onClick={searchFriends} />
                </div>
                {
                    searchResults &&
                    <div>
                        {searchResults.map(user => (
                            <Friend friendList={friends!} data={user} supabase={supabase} />
                        ))}
                    </div>
                }
            </div>
            {
                requests !== null && requests.length > 0 &&
                <div className="friend-requests">
                    <h3>Friend Requests</h3>
                    {
                        requests.map(request => (
                            <Friend
                                friendList={friends!}
                                data={request}
                                supabase={supabase}
                            />
                        ))
                    }
                </div>
            }
            <div className="friends-container">
                <h2>My Friends</h2>
                {
                    friends !== null &&
                    (
                        friends.length > 0 ?
                            <div>
                                {
                                    friends
                                        .filter(friend => friend.status === RELATIONSHIP_STATUS.FRIENDS)
                                        .map(friend => (
                                            <Friend
                                                friendList={friends!}
                                                data={friend}
                                                supabase={supabase}
                                            />
                                        ))
                                }
                            </div>
                            :
                            <p>No friends yet.</p>
                    )
                }
            </div>
        </div>
    )
}

function Friend({ friendList, data, supabase }: {
    friendList: User[],
    data: User,
    supabase: Supabase
}) {
    const [status, setStatus] = useState(0);
    const router = useRouter()

    useEffect(() => {
        if ("status" in data) {
            setStatus(data.status!);
        } else {
            const foundFriend = friendList.find(friend => friend.id === data.id);
            if (foundFriend) {
                setStatus(foundFriend.status!);
            } else {
                setStatus(0);
            }
        }
    }, [data]);

    const getButtonString = () => {
        let string = '';

        if (status === RELATIONSHIP_STATUS.NO_RELATION) {
            string = "+ add";
        } else if (status === RELATIONSHIP_STATUS.REQUESTER) {
            string = "requested"
        } else if (status === RELATIONSHIP_STATUS.REQUESTEE) {
            string = "confirm request"
        } else if (status === RELATIONSHIP_STATUS.FRIENDS) {
            string = "remove"
        }
        return string;
    }

    const onButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (status === RELATIONSHIP_STATUS.NO_RELATION) {
            supabase.sendFriendRequest(data.id);
            setStatus(1);
        } else if (status === RELATIONSHIP_STATUS.REQUESTEE) {
            supabase.acceptRequest(data.id);
            setStatus(3);
        } else if (status === RELATIONSHIP_STATUS.REQUESTER || status === RELATIONSHIP_STATUS.FRIENDS) {
            supabase.removeFriend(data.id);
            setStatus(0);
        }
        router.refresh();
    }

    return (
        <div className="friend-wrapper">
            <div className="friend-info">
                {data.profilePic ?
                    <img src={data.profilePic} />
                    :
                    <div className="profile-pic-placeholder"></div>
                }
                <p>{"@" + data.username}</p>
            </div>
            <Button handleClick={onButtonClick}>{getButtonString()}</Button>
        </div>
    );
}