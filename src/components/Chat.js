import React, { useState, useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { client } = useAuth(); // Access the authenticated client
  const [users, setUsers] = useState([]); // List of users (clients)
  const [selectedUser, setSelectedUser] = useState(null); // Currently selected user to chat with
  const [messages, setMessages] = useState([]); // Messages between the client and selected user
  const [newMessage, setNewMessage] = useState(''); // New message input
  const messagesEndRef = useRef(null); // Reference to the end of the messages list

  // Initialize socket connection
  const socket = useMemo(() => {
    return io('http://localhost:5001', {
      auth: {
        token: localStorage.getItem('jwt_token'),
      },
    });
  }, []);

  // Fetch users (clients)
  useEffect(() => {
    if (client) {
      fetch('http://localhost:5001/api/client/auth/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error('Error fetching clients:', err));
    }
  }, [client]);

  // Fetch messages and set up socket listener
  useEffect(() => {
    if (selectedUser && client) {
      // Fetch messages between the client and the selected user
      fetch(`http://localhost:5001/api/messages/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
          scrollToBottom();
        })
        .catch((err) => console.error('Error fetching messages:', err));

      // Listen for new messages via Socket.IO
      socket.on('chat message', (msg) => {
        if (
          (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) &&
          (msg.sender === client.clientId || msg.receiver === client.clientId)
        ) {
          setMessages((prevMessages) => [...prevMessages, msg]);
          scrollToBottom();
        }
      });
    }

    return () => {
      socket.off('chat message');
    };
  }, [selectedUser, client, socket]);

  // Scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to send a message
  const sendMessage = () => {
    if (!selectedUser || !client) {
      alert('Please select a user to chat with.');
      return;
    }

    if (!newMessage.trim()) {
      alert('Please enter a message.');
      return;
    }

    const message = {
      sender: client.clientId, // Sender's ID (authenticated client)
      receiver: selectedUser._id, // Ensure field matches backend expectations
      content: newMessage, // The message content
    };

    // Send message to the server
    fetch('http://localhost:5001/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Add the token
      },
      body: JSON.stringify(message), // Send message object with sender and receiver
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Failed to send message');
          });
        }
        return response.json();
      })
      .then((data) => {
        socket.emit('chat message', data); // Emit the message via Socket.IO
        setMessages((prevMessages) => [...prevMessages, data]); // Update the message list
        setNewMessage(''); // Clear input field
        scrollToBottom();
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error sending message: ' + error.message); // Display an error message
      });
  };

  // Render the component
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* User List */}
        <div className="col-md-3 border-right bg-light p-3">
          <h5 className="border-bottom pb-2">Users</h5>
          <ul className="list-group">
            {users.map((user) => (
              <li
                key={user._id}
                className={`list-group-item ${
                  selectedUser && selectedUser._id === user._id ? 'active' : ''
                }`}
                onClick={() => setSelectedUser(user)}
                style={{ cursor: 'pointer' }}
              >
                {user.clientname}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 d-flex flex-column">
          {/* Header */}
          <div className="border-bottom p-3">
            <h5 className="mb-0">
              {selectedUser
                ? `Chat with ${selectedUser.clientname}`
                : 'Select a user to start chatting'}
            </h5>
          </div>

          {/* Messages */}
          <div
            className="flex-grow-1 overflow-auto p-3"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            {selectedUser ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex mb-3 ${
                    msg.sender === client.clientId ? 'justify-content-end' : 'justify-content-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded ${
                      msg.sender === client.clientId ? 'bg-primary text-white' : 'bg-light text-dark'
                    }`}
                    style={{ maxWidth: '75%' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <p>Select a user to view messages</p>
            )}
            {/* Reference div for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {selectedUser && (
            <div className="border-top p-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUser.clientname}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <div className="input-group-append">
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
