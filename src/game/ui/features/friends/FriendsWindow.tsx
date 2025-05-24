import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FriendItem from './FriendItem';
import FriendRequestItem from './FriendRequestItem';
import SearchUserItem from './SearchUserItem';
import { friendService } from '../../service/friendService';

interface FriendsPageProps {
    currentUserId: number;
}

enum FriendTab {
    FRIENDS = 'friends',
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    SEARCH = 'search'
}

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

interface FriendRequest {
    id: number;
    sender: User;
    receiver: User;
    createdAt: string;
}

const FriendsWindow: React.FC<FriendsPageProps> = ({ currentUserId }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FriendTab>(FriendTab.FRIENDS);
    const [friends, setFriends] = useState<User[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Загрузка данных для активной вкладки
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                switch (activeTab) {
                    case FriendTab.FRIENDS:
                        const friendsList = await friendService.getFriends(currentUserId);
                        setFriends(friendsList);
                        break;
                    case FriendTab.INCOMING:
                        const incomingList = await friendService.getIncomingRequests(currentUserId);
                        setIncomingRequests(incomingList);
                        break;
                    case FriendTab.OUTGOING:
                        const outgoingList = await friendService.getOutgoingRequests(currentUserId);
                        setOutgoingRequests(outgoingList);
                        break;
                    case FriendTab.SEARCH:
                        if (searchQuery) {
                            handleSearch();
                        }
                        break;
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, currentUserId]);

    // Обработчик поиска
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const results = await friendService.searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Проверка, является ли пользователь другом
    const isFriend = (userId: number): boolean => {
        return friends.some(friend => friend.id === userId);
    };

    // Проверка, есть ли исходящая заявка к пользователю
    const isPendingRequest = (userId: number): boolean => {
        return outgoingRequests.some(request => request.receiver.id === userId);
    };

    // Обработчик отправки заявки в друзья
    const handleSendRequest = async (receiverId: number) => {
        try {
            await friendService.sendFriendRequest(currentUserId, receiverId);
            // Обновляем список исходящих заявок
            const outgoingList = await friendService.getOutgoingRequests(currentUserId);
            setOutgoingRequests(outgoingList);
            // Обновляем результаты поиска
            handleSearch();
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    // Обработчик принятия заявки
    const handleAcceptRequest = async (requestId: number) => {
        try {
            await friendService.acceptFriendRequest(currentUserId, requestId);
            // Обновляем списки заявок и друзей
            const [friendsList, incomingList] = await Promise.all([
                friendService.getFriends(currentUserId),
                friendService.getIncomingRequests(currentUserId)
            ]);
            setFriends(friendsList);
            setIncomingRequests(incomingList);
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    // Обработчик отклонения заявки
    const handleRejectRequest = async (requestId: number) => {
        try {
            await friendService.rejectFriendRequest(currentUserId, requestId);
            // Обновляем список входящих заявок
            const incomingList = await friendService.getIncomingRequests(currentUserId);
            setIncomingRequests(incomingList);
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    // Обработчик отмены исходящей заявки
    const handleCancelRequest = async (requestId: number) => {
        try {
            await friendService.rejectFriendRequest(currentUserId, requestId);
            // Обновляем список исходящих заявок
            const outgoingList = await friendService.getOutgoingRequests(currentUserId);
            setOutgoingRequests(outgoingList);
        } catch (error) {
            console.error('Error canceling friend request:', error);
        }
    };

    // Обработчик удаления друга
    const handleRemoveFriend = async (friendId: number) => {
        try {
            await friendService.removeFriend(currentUserId, friendId);
            // Обновляем список друзей
            const friendsList = await friendService.getFriends(currentUserId);
            setFriends(friendsList);
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    // Переход к профилю
    const handleViewProfile = (userId: number) => {
        navigate(`/character/${userId}`);
    };

    // Рендер контента в зависимости от активной вкладки
    const renderTabContent = () => {
        if (loading) {
            return <div className="friends-window__loading">Loading...</div>;
        }

        switch (activeTab) {
            case FriendTab.FRIENDS:
                return friends.length > 0 ? (
                    friends.map(friend => (
                        <FriendItem
                            key={friend.id}
                            friend={friend}
                            onRemove={handleRemoveFriend}
                            onViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div className="friends-window__empty">You don't have any friends yet</div>
                );

            case FriendTab.INCOMING:
                return incomingRequests.length > 0 ? (
                    incomingRequests.map(request => (
                        <FriendRequestItem
                            key={request.id}
                            request={request}
                            incoming={true}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                            onViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div className="friends-window__empty">No incoming friend requests</div>
                );

            case FriendTab.OUTGOING:
                return outgoingRequests.length > 0 ? (
                    outgoingRequests.map(request => (
                        <FriendRequestItem
                            key={request.id}
                            request={request}
                            incoming={false}
                            onCancel={handleCancelRequest}
                            onViewProfile={handleViewProfile}
                        />
                    ))
                ) : (
                    <div className="friends-window__empty">No outgoing friend requests</div>
                );

            case FriendTab.SEARCH:
                return (
                    <>
                        <div className="friends-window__search">
                            <div className="friends-window__search-form">
                                <input
                                    type="text"
                                    placeholder="Search for players..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="friends-window__search-input"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="friends-window__search-button"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <SearchUserItem
                                    key={user.id}
                                    user={user}
                                    onSendRequest={handleSendRequest}
                                    onViewProfile={handleViewProfile}
                                    currentUserId={currentUserId}
                                    isFriend={isFriend(user.id)}
                                    isPending={isPendingRequest(user.id)}
                                />
                            ))
                        ) : searchQuery ? (
                            <div className="friends-window__empty">No users found</div>
                        ) : null}
                    </>
                );
        }
    };

    // Рендер счетчиков для вкладок
    const renderTabCounter = (tab: FriendTab) => {
        switch (tab) {
            case FriendTab.FRIENDS:
                return friends.length > 0 ? friends.length : null;
            case FriendTab.INCOMING:
                return incomingRequests.length > 0 ? incomingRequests.length : null;
            case FriendTab.OUTGOING:
                return outgoingRequests.length > 0 ? outgoingRequests.length : null;
            default:
                return null;
        }
    };

    return (
        <div className="friends-window">
            <div className="friends-window__header">
                <h2 className="friends-window__title">Friends</h2>
            </div>

            {/* Навигационные вкладки */}
            <div className="friends-window__tabs">
                {Object.values(FriendTab).map(tab => (
                    <button
                        key={tab}
                        className={`friends-window__tab ${activeTab === tab ? 'friends-window__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {renderTabCounter(tab) && (
                            <span className="friends-window__tab-counter">
                                {renderTabCounter(tab)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Контент активной вкладки */}
            <div className="friends-window__content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default FriendsWindow;