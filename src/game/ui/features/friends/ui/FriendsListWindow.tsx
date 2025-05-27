import {useEffect, useState} from "react";
import "../styles/friendsList.scss"

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

enum FriendTab {
    FRIENDS = 'friends',
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    SEARCH = 'search'
}

const FriendsListWindow: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FriendTab>(FriendTab.FRIENDS);
    const [friends, setFriends] = useState<User[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper function to format time
    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'just now';
    };

    // Mock data
    useEffect(() => {
        setFriends([
            {
                id: 1,
                characterName: 'Deadkevin',
                level: 33,
                class: 'Priest',
                online: true,
                lastOnline: new Date(),
                avatar: '/api/placeholder/32/32'
            },
            {
                id: 2,
                characterName: 'Joram',
                level: 26,
                class: 'Warlock',
                online: true,
                lastOnline: new Date(),
                avatar: '/api/placeholder/32/32'
            },
            {
                id: 3,
                characterName: 'Monsterbuds',
                level: 36,
                class: 'Hunter',
                online: false,
                lastOnline: new Date(Date.now() - 3600000),
                avatar: '/api/placeholder/32/32'
            },
            {
                id: 4,
                characterName: 'Stratos',
                level: 42,
                class: 'Warrior',
                online: false,
                lastOnline: new Date(Date.now() - 86400000),
                avatar: '/api/placeholder/32/32'
            }
        ]);

        setIncomingRequests([
            {
                id: 1,
                sender: {
                    id: 10,
                    characterName: 'NewPlayer',
                    level: 15,
                    class: 'Mage',
                    online: true,
                    lastOnline: new Date(),
                    avatar: '/api/placeholder/32/32'
                },
                receiver: { id: 1 } as User,
                createdAt: new Date(Date.now() - 1800000).toISOString()
            }
        ]);
    }, []);

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

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        // Mock search results
        setSearchResults([
            {
                id: 20,
                characterName: 'TestPlayer',
                level: 25,
                class: 'Paladin',
                online: false,
                lastOnline: new Date(Date.now() - 7200000),
                avatar: '/api/placeholder/32/32',
                friendCount: 5
            }
        ]);
    };

    const getClassColor = (className: string) => {
        const classColors: { [key: string]: string } = {
            'Priest': '#ffffff',
            'Warlock': '#9482c9',
            'Hunter': '#abd473',
            'Warrior': '#c79c6e',
            'Mage': '#69ccf0',
            'Paladin': '#f58cba',
            'Rogue': '#fff569',
            'Shaman': '#0070de',
            'Druid': '#ff7d0a'
        };
        return classColors[className] || '#ffffff';
    };

    const renderTabContent = () => {
        if (loading) {
            return <div className="friends-loading">Loading...</div>;
        }

        switch (activeTab) {
            case FriendTab.FRIENDS:
                return (
                    <div className="friends-content">
                        {friends.length > 0 ? (
                            friends.map(friend => (
                                <div key={friend.id} className="friend-entry">
                                    <div className="friend-status">
                                        <div className={`status-indicator ${friend.online ? 'online' : 'offline'}`} />
                                    </div>
                                    <div className="friend-info">
                                        <div className="friend-name" style={{ color: getClassColor(friend.class) }}>
                                            {friend.characterName}
                                        </div>
                                        <div className="friend-details">
                                            Level {friend.level} {friend.class}
                                        </div>
                                        <div className="friend-location">
                                            {friend.online ? 'Online' : `Offline ${formatTimeAgo(friend.lastOnline)} ago`}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message">You don't have any friends yet</div>
                        )}
                    </div>
                );

            case FriendTab.INCOMING:
                return (
                    <div className="friends-content">
                        {incomingRequests.length > 0 ? (
                            incomingRequests.map(request => (
                                <div key={request.id} className="friend-request">
                                    <div className="friend-status">
                                        <div className={`status-indicator ${request.sender.online ? 'online' : 'offline'}`} />
                                    </div>
                                    <div className="friend-info">
                                        <div className="friend-name" style={{ color: getClassColor(request.sender.class) }}>
                                            {request.sender.characterName}
                                        </div>
                                        <div className="friend-details">
                                            Level {request.sender.level} {request.sender.class}
                                        </div>
                                        <div className="friend-location">
                                            Sent {formatTimeAgo(new Date(request.createdAt))} ago
                                        </div>
                                    </div>
                                    <div className="request-actions">
                                        <button className="accept-btn">✓</button>
                                        <button className="reject-btn">✗</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message">No incoming friend requests</div>
                        )}
                    </div>
                );

            case FriendTab.SEARCH:
                return (
                    <div className="friends-content">
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search for players..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="search-button">
                                Search
                            </button>
                        </div>
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <div key={user.id} className="search-result">
                                    <div className="friend-status">
                                        <div className={`status-indicator ${user.online ? 'online' : 'offline'}`} />
                                    </div>
                                    <div className="friend-info">
                                        <div className="friend-name" style={{ color: getClassColor(user.class) }}>
                                            {user.characterName}
                                        </div>
                                        <div className="friend-details">
                                            Level {user.level} {user.class}
                                        </div>
                                        <div className="friend-location">
                                            {user.friendCount} friends
                                        </div>
                                    </div>
                                    <div className="search-actions">
                                        <button className="add-friend-btn">Add Friend</button>
                                    </div>
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="empty-message">No users found</div>
                        ) : null}
                    </div>
                );

            default:
                return <div className="empty-message">No outgoing friend requests</div>;
        }
    };

    return (
        <div className="wow-friends-window">
            <div className="friends-header">
                <div className="header-decoration-left" />
                <h2 className="friends-title">Friends List</h2>
                <button className="close-button">×</button>
            </div>

            <div className="friends-service-warning">
                <span className="warning-icon">⚠</span>
                Blizzard services are unavailable
                <span className="info-icon">ℹ</span>
            </div>

            <div className="friends-tabs">
                {Object.values(FriendTab).map(tab => (
                    <button
                        key={tab}
                        className={`friends-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {renderTabCounter(tab) && (
                            <span className="tab-counter">
                                {renderTabCounter(tab)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="friends-list-container">
                {renderTabContent()}
            </div>

            <div className="friends-footer">
                <button className="footer-button">Add Friend</button>
                <button className="footer-button">Send Message</button>
            </div>

            <div className="bottom-tabs">
                <button className="bottom-tab active">Friends</button>
                <button className="bottom-tab">Who</button>
                <button className="bottom-tab">Guild</button>
                <button className="bottom-tab">Raid</button>
            </div>

        </div>
    );
};

export default FriendsListWindow;