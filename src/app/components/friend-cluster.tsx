import { useState } from 'react';
import { User } from '../types';
import Link from "next/link";
import useWindowDimensions from '../utils/useWindowDimensions';
import './style.scss';

function FriendCluster({ friends }: { friends: User[] }) {
    const [open, setOpen] = useState(false);
    const { height, width } = useWindowDimensions();

    const handleMouseEnter = () => {
        setOpen(true);
    }

    const handleMouseLeave = () => {
        setOpen(false);
    }

    return (
        <div className="friend-cloud"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                width: `${(Math.min(friends.length, 3) - 1) * (width < 600 ? 4 : 8) + (width < 600 ? 20 : 25)}px`
            }}>
            {
                friends.slice(0, 3).map((friend, index) => (
                    <div
                        className="friend-circle"
                        style={{
                            left: `${(width < 600 ? 4 : 8) * index}px`,
                            zIndex: `${4 - index}`
                        }}
                    >
                        {friend.profilePic &&
                            <img src={friend.profilePic} />
                        }
                    </div>
                ))
            }
            {
                open && friends.length > 1 &&
                <div className="friend-list">
                    {
                        friends.map(friend => (
                            <p className="friend-name"><Handle username={friend.username!} /></p>
                        ))
                    }
                </div>
            }
        </div>
    )
}

export default function ActFriendList({ friends }: { friends: User[] }) {
    return (
        <div className="act-friends-wrapper">
            <FriendCluster friends={friends} />
            <p className="act-friend-text">{friends.length > 1 ?
                <>
                    <Handle username={friends[0].username!} />
                    {` and ${friends.length - 1} other friends are going`}
                </>
                :
                <>
                    <Handle username={friends[0].username!} />
                    {` is going`}
                </>
            }</p>
        </div>
    )
}

export function Handle({ username }: { username: string }) {
    return (
        <Link href={`/user/${username}`}>
            <span className="username">{`@${username}`}</span>
        </Link>
    );
}