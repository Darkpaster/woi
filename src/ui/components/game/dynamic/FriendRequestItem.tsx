import {FriendRequest} from "../../../service/friendService.ts";

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
        <div
            className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.characterName}
                        className="w-12 h-12 rounded-full"
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
                    <p className="text-xs text-gray-500">{createdAtText}</p>
                </div>
            </div>

            <div className="flex space-x-2">
                {incoming ? (
                    <>
                        <button
                            onClick={() => onAccept && onAccept(request.id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onReject && onReject(request.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onCancel && onCancel(request.id)}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default FriendRequestItem;