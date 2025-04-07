import { useState } from 'react';
import { User } from '../types';
import './style.scss';

function FriendCluster({ friends }: { friends: User[] }) {
    const [open, setOpen] = useState(false);

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
                width: `${(Math.min(friends.length, 3) - 1) * 8 + 25}px`
            }}>
            {
                friends.slice(0, 3).map((friend, index) => (
                    <div
                        className="friend-circle"
                        style={{
                            left: `${8 * index}px`,
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
                            <p className="friend-name">@{friend.username}</p>
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
                `@${friends[0].username} and ${friends.length - 1} other friends are going`
                :
                `@${friends[0].username} is going`
            }</p>
        </div>
    )
}