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
        <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <img
                        src={friend.avatar || '/default-avatar.png'}
                        alt={friend.characterName}
                        className="w-12 h-12 rounded-full"
                    />
                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${friend.online ? 'bg-green-500' : 'bg-gray-500'}`}
                    />
                </div>

                <div>
                    <h3 className="font-medium text-white">{friend.characterName}</h3>
                    <p className="text-sm text-gray-400">
                        Lvl {friend.level} {friend.class}
                    </p>
                    <p className="text-xs text-gray-500">{lastOnlineText}</p>
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => onViewProfile(friend.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                    Profile
                </button>
                <button
                    onClick={() => onRemove(friend.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default FriendItem;