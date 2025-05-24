import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface User {
    id: number;
    characterName: string;
    avatar?: string;
    online: boolean;
    lastOnline: Date;
    level: number;
    class: string;
}

interface FriendItemProps {
    friend: User;
    onRemove: (friendId: number) => void;
    onViewProfile: (userId: number) => void;
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, onRemove, onViewProfile }) => {
    const lastOnlineText = friend.online
        ? 'Online'
        : `Last online ${formatDistanceToNow(friend.lastOnline)} ago`;

    return (
        <div className="friend-item">
            <div className="friend-item__content">
                <div className="friend-item__avatar-container">
                    <img
                        src={friend.avatar || '/default-avatar.png'}
                        alt={friend.characterName}
                        className="friend-item__avatar"
                    />
                    <span className={`friend-item__status ${friend.online ? 'friend-item__status--online' : 'friend-item__status--offline'}`} />
                </div>

                <div className="friend-item__info">
                    <h3 className="friend-item__name">{friend.characterName}</h3>
                    <p className="friend-item__details">
                        Lvl {friend.level} {friend.class}
                    </p>
                    <p className="friend-item__last-online">{lastOnlineText}</p>
                </div>
            </div>

            <div className="friend-item__actions">
                <button
                    onClick={() => onViewProfile(friend.id)}
                    className="friend-item__button friend-item__button--profile"
                >
                    Profile
                </button>
                <button
                    onClick={() => onRemove(friend.id)}
                    className="friend-item__button friend-item__button--remove"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default FriendItem;