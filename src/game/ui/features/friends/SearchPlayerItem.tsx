interface SearchUserItemProps {
    user: User;
    onSendRequest: (userId: number) => void;
    onViewProfile: (userId: number) => void;
    currentUserId: number;
    isFriend: boolean;
    isPending: boolean;
}

const SearchUserItem: React.FC<SearchUserItemProps> = ({
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
        <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.characterName}
                        className="w-12 h-12 rounded-full cursor-pointer"
                        onClick={() => onViewProfile(user.id)}
                    />
                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-500'}`}
                    />
                </div>

                <div>
                    <h3 className="font-medium text-white">{user.characterName}</h3>
                    <p className="text-sm text-gray-400">
                        Lvl {user.level} {user.class}
                    </p>
                    <p className="text-xs text-gray-500">
                        {user.friendCount} {user.friendCount === 1 ? 'friend' : 'friends'}
                    </p>
                </div>
            </div>

            <div>
                {isFriend ? (
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded">
            Friend
          </span>
                ) : isPending ? (
                    <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded">
            Pending
          </span>
                ) : (
                    <button
                        onClick={() => onSendRequest(user.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Add Friend
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchUserItem;