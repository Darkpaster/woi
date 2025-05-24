import React from 'react';

interface User {
    id: number;
    characterName: string;
    avatar?: string;
    online: boolean;
    lastOnline: Date;
    level: number;
    class: string;
    friendCount?: number;
}

interface SearchUserItemProps {
    user: User;
    onSendRequest: (userId: number) => void;
    onViewProfile: (userId: number) => void;
    currentUserId: number;
    isFriend: boolean;
    isPending: boolean;
}

const SearchPlayerItem: React.FC<SearchUserItemProps> = ({
                                                           user,
                                                           onSendRequest,
                                                           onViewProfile,
                                                           currentUserId,
                                                           isFriend,
                                                           isPending
                                                       }) => {
    // Не показываем текущего пользователя в результатах поиска
    if (user.id === currentUserId) return null;

    return (
        <div className="search-user-item">
            <div className="search-user-item__content">
                <div className="search-user-item__avatar-container">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.characterName}
                        className="search-user-item__avatar"
                        onClick={() => onViewProfile(user.id)}
                    />
                    <span className={`search-user-item__status ${user.online ? 'search-user-item__status--online' : 'search-user-item__status--offline'}`} />
                </div>

                <div className="search-user-item__info">
                    <h3 className="search-user-item__name">{user.characterName}</h3>
                    <p className="search-user-item__details">
                        Lvl {user.level} {user.class}
                    </p>
                    <p className="search-user-item__friends">
                        {user.friendCount} {user.friendCount === 1 ? 'friend' : 'friends'}
                    </p>
                </div>
            </div>

            <div className="search-user-item__actions">
                {isFriend ? (
                    <span className="search-user-item__status-badge search-user-item__status-badge--pending">
                        Pending
                    </span>
                ) : (
                    <button
                        onClick={() => onSendRequest(user.id)}
                        className="search-user-item__button search-user-item__button--add"
                    >
                        Add Friend
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchPlayerItem;