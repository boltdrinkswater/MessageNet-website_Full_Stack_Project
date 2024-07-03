import React, { useState, useEffect, useRef } from 'react';
import './last.css';
import axios from 'axios';
import Cookies from 'js-cookie';

function Last() {
    const [file, setFile] = useState(null);
    const [userProfilePic, setUserProfilePic] = useState('');
    const [friendname, setFriendname] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const username = Cookies.get('username'); 
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUserProfilePic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${username}`);
                const profilePicFilename = response.data.profilePicFilename;
                const friendsList = response.data.friends; // Get friends list from response

                const friendsWithPics = await Promise.all(friendsList.map(async (friend) => {
                    const friendResponse = await axios.get(`http://localhost:5000/api/user/${friend}`);
                    return {
                        username: friend,
                        profilePicFilename: friendResponse.data.profilePicFilename
                    };
                }));

                setUserProfilePic(profilePicFilename);
                setFriends(friendsWithPics); // Set friends list with profile pictures in state
            } catch (error) {
                console.error('Error fetching user profile picture:', error);
            }
        };

        fetchUserProfilePic(); // Call the function once after the component mounts
    }, [username]); // Add username as a dependency to ensure it updates correctly

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(`http://localhost:5000/api/upload/${username}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user profile picture URL after successful upload
            setUserProfilePic(response.data.profilePicFilename);

            // Optionally, update UI to indicate successful upload
            alert('Profile picture updated successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to update profile picture');
        }
    };

    const handleAddFriend = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/frequest', {
                friendname,
                username
            });

            if (response.data.message === 'Friend added') {
                alert('Friend added');
                setFriends([...friends, { username: friendname, profilePicFilename: '' }]); // Add new friend to the state
            } else if (response.data.message === 'Friend already added') {
                alert('Friend already added');
            } else {
                alert('Friend not found');
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            alert('An error occurred while adding friend');
        }
    };

    const handleSelectFriend = async (friend) => {
        setSelectedFriend(friend.username);
        try {
            const response = await axios.get(`http://localhost:5000/api/messages/${username}/${friend.username}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/message', {
                sender: username,
                recipient: selectedFriend,
                content: newMessage,
            });
            setMessages([...messages, { sender: username, recipient: selectedFriend, content: newMessage, timestamp: new Date() }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <>
        <div className="whatever">
            <div className="nav-bar">
                <img src="public/assets/message.png" alt="Message Icon" />
                <h1>MessageNet</h1>
            </div>

            <div className="outer-div">
                <div className="left-div">
                    <div>
                        <input className="add-friend"
                            placeholder="Type a username" 
                            value={friendname} 
                            onChange={(e) => setFriendname(e.target.value)}
                        />
                        <button id="btn-add" type='submit' onClick={handleAddFriend}>Add Friend</button>
                    </div>

                    <div className="bottom-left">
                        {friends.map((friend, index) => (
                            <div
                                className={`friendlist-div ${selectedFriend === friend.username ? 'active' : ''}`}
                                key={index}
                                onClick={() => handleSelectFriend(friend)}
                            >
                                <img src={`http://localhost:5000/uploads/${friend.profilePicFilename}`} alt={friend.username} className="friend-pic" />
                                <p>{friend.username}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="right-div">
                    {selectedFriend ? (
                        <div>
                            <div className="header-chat">
                                <h2>{selectedFriend}</h2>
                            </div>
                            <div className="messages">
                                {messages.map((msg, index) => (
                                    <div key={index} className={msg.sender === username ? 'message-sent' : 'message-received'}>
                                        <p><strong>{msg.sender}</strong>: {msg.content} <em>{new Date(msg.timestamp).toLocaleTimeString()}</em></p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div id="msg">
                                <input id="typeamessage"
                                    type="text" 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)} 
                                    placeholder="Type a message" 
                                />
                                <button onClick={handleSendMessage}>Send</button>
                            </div>
                        </div>
                    ) : (
                        <p>Select a friend to chat with</p>
                    )}
                </div>
                <div className="right-right-div">
                    <div id="user-pfp" style={{ backgroundImage: `url(http://localhost:5000/uploads/${userProfilePic})` }}></div>
                    <div id="username-display">{username}</div>
                    <div id="great">
                        <p> Update profile picture</p>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div>
                        <button onClick={handleUpload}>Upload</button>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
}

export default Last;
