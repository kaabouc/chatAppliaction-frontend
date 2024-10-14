import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

const Chat = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch users
    fetch('http://localhost:5001/api/client/auth/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store the token in localStorage
      }
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err));

    // Setup socket connection
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('authenticate', { token: localStorage.getItem('token') });
    });

    return () => {
      socket.off('connect');
      socket.off('authenticate');
    };
  }, []);

  useEffect(() => {
    if (selectedUser && currentUser) {
      // Fetch messages
      fetch(`http://localhost:5001/api/messages/${currentUser._id}/${selectedUser._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error('Error fetching messages:', err));

      // Listen for new messages
      socket.on('chat message', (msg) => {
        if (
          (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) &&
          (msg.sender === currentUser._id || msg.receiver === currentUser._id)
        ) {
          setMessages((prevMessages) => [...prevMessages, msg]);
        }
      });
    }

    return () => {
      socket.off('chat message');
    };
  }, [selectedUser, currentUser]);

  const sendMessage = () => {
    if (!selectedUser || !currentUser) {
      alert('Please select a user to chat with.');
      return;
    }

    if (!newMessage.trim()) {
      alert('Please enter a message.');
      return;
    }

    const message = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      content: newMessage,
    };

    // Send message to server
    fetch('http://localhost:5001/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(message)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Message sent:', data);
        socket.emit('chat message', data);
        setMessages(prevMessages => [...prevMessages, data]);
        setNewMessage('');
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
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

        <div className="col-md-9 d-flex flex-column">
          <div className="border-bottom p-3">
            <h5 className="mb-0">
              {selectedUser
                ? `Chat with ${selectedUser.clientname}`
                : 'Select a user to start chatting'}
            </h5>
          </div>

          <div
            className="flex-grow-1 overflow-auto p-3"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            {selectedUser ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === currentUser._id ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`badge badge-${
                      msg.sender === currentUser._id ? 'primary' : 'secondary'
                    } p-2`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))
            ) : (
              <p>Select a user to view messages</p>
            )}
          </div>

          {selectedUser && ( 
  <div className="border-top p-3"> 
    <div className="input-group"> 
      <input 
        type="text" 
        className="form-control" 
        value={newMessage} 
        onChange={(e) => setNewMessage(e.target.value)} 
        placeholder={`Message ${selectedUser.clientname}`} 
      /> 
      <div className="input-group-append d-flex"> 
        <label htmlFor="file-upload" className="btn btn-outline-secondary mb-0 d-flex align-items-center justify-content-center" style={{width: '40px', height: '38px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
          </svg>
          <input 
            id="file-upload" 
            type="file" 
            style={{ display: 'none' }} 
            // onChange={handleFileUpload} 
          />
        </label>
        <label htmlFor="image-upload" className="btn btn-outline-secondary mb-0 d-flex align-items-center justify-content-center" style={{width: '40px', height: '38px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
          </svg>
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            // onChange={handleImageUpload} 
          />
        </label>
        <button  
          className="btn btn-primary"  
          onClick={sendMessage} 
        > 
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