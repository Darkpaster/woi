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

interface FriendRequest {
    id: number;
    sender: User;
    receiver: User;
    createdAt: string;
}

interface FriendRequestItemProps {
    request: FriendRequest;
    incoming?: boolean;
    onAccept?: (requestId: number) => void;
    onReject?: (requestId: number) => void;
    onCancel?: (requestId: number) => void;
    onViewProfile: (userId: number) => void;
}

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
                                                                 request,
                                                                 incoming = true,
                                                                 onAccept,
                                                                 onReject,
                                                                 onCancel,
                                                                 onViewProfile
                                                             }) => {
    const user = incoming ? request.sender : request.receiver;
    const createdAtText = `Sent ${formatDistanceToNow(new Date(request.createdAt))} ago`;

    return (
        <div className="friend-request-item">
            <div className="friend-request-item__content">
                <div className="friend-request-item__avatar-container">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.characterName}
                        className="friend-request-item__avatar"
                        onClick={() => onViewProfile(user.id)}
                    />
                    <span className={`friend-request-item__status ${user.online ? 'friend-request-item__status--online' : 'friend-request-item__status--offline'}`} />
                </div>

                <div className="friend-request-item__info">
                    <h3 className="friend-request-item__name">{user.characterName}</h3>
                    <p className="friend-request-item__details">
                        Lvl {user.level} {user.class}
                    </p>
                    <p className="friend-request-item__time">{createdAtText}</p>
                </div>
            </div>

            <div className="friend-request-item__actions">
                {incoming ? (
                    <>
                        <button
                            onClick={() => onAccept && onAccept(request.id)}
                            className="friend-request-item__button friend-request-item__button--accept"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onReject && onReject(request.id)}
                            className="friend-request-item__button friend-request-item__button--reject"
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onCancel && onCancel(request.id)}
                        className="friend-request-item__button friend-request-item__button--cancel"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default FriendRequestItem;