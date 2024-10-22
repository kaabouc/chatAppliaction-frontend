import React, { useState, useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const Chat = () => {
  const { client } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = useMemo(() => io('http://localhost:3000', { auth: { token: localStorage.getItem('jwt_token') } }), []);

  useEffect(() => {
    if (client) {
      fetch('http://localhost:5001/api/client/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const filteredUsers = data.filter(user => user._id !== client.clientId);
          setUsers(filteredUsers);
        })
        .catch((err) => console.error('Error fetching clients:', err));
    }
  }, [client]);

  const fetchMessages = () => {
    if (selectedUser && client) {
      fetch(`http://localhost:5001/api/messages/${client.clientId}/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
          scrollToBottom();
        })
        .catch((err) => console.error('Error fetching messages:', err));
    }
  };

  useEffect(() => {
    fetchMessages(); // Fetch messages when a user is selected

    socket.on('chat message', (msg) => {
      if (
        (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) &&
        (msg.sender === client.clientId || msg.receiver === client.clientId)
      ) {
        setMessages((prevMessages) => [...prevMessages, msg]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('chat message');
    };
  }, [selectedUser, client, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messages change
  }, [messages]);

  const sendMessage = () => {
    if (!selectedUser || !client) {
      alert('Please select a user to chat with.');
      return;
    }

    if (!newMessage.trim() && !imageFile && !pdfFile) {
      alert('Please enter a message or select a file.');
      return;
    }

    const message = {
      sender: client.clientId,
      receiver: selectedUser._id,
      content: newMessage.trim(),
    };

    const formData = new FormData();
    formData.append('message', JSON.stringify(message));
    if (imageFile) {
      formData.append('file', imageFile);
    } else if (pdfFile) {
      formData.append('file', pdfFile);
    }

    const token = localStorage.getItem('jwt_token');
    fetch('http://localhost:5001/api/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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
        console.log('Message sent:', data);
        socket.emit('chat message', data);
        fetchMessages(); // Call fetchMessages to refresh messages
        setNewMessage('');
        setImageFile(null);
        setPdfFile(null);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error sending message: ' + error.message);
      });
  };

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
    setPdfFile(null); // Clear PDF if image is selected
  };

  const handlePdfUpload = (e) => {
    setPdfFile(e.target.files[0]);
    setImageFile(null); // Clear image if PDF is selected
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
                className={`list-group-item ${selectedUser && selectedUser._id === user._id ? 'active' : ''}`}
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
              {selectedUser ? `Chat with ${selectedUser.clientname}` : 'Select a user to start chatting'}
            </h5>
          </div>

          <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#f8f9fa', maxHeight: '600px', overflowY: 'scroll' }}>
            {selectedUser ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 d-flex ${msg.sender === client.clientId ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`message-bubble ${msg.sender === client.clientId ? 'sent' : 'received'}`}
                    style={{
                      backgroundColor: msg.sender === client.clientId ? '#007bff' : '#e0e0e0',
                      color: msg.sender === client.clientId ? 'white' : 'black',
                      padding: '10px',
                      borderRadius: '10px',
                      maxWidth: '60%',
                      textAlign: msg.sender === client.clientId ? 'right' : 'left',
                      position: 'relative',
                    }}
                  >
                    <span style={{ display: 'block', marginBottom: '5px' }}>
                      {msg.content || ''}
                    </span>

                    {msg.image && (
                      <img
                        src={`http://localhost:5001/${msg.image}`}
                        alt="Sent"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          marginTop: '5px',
                          borderRadius: '10px',
                          display: 'block',
                        }}
                      />
                    )}

                    {msg.file && !msg.image && (
                      <a
                        href={`http://localhost:5001/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: msg.sender === client.clientId ? 'white' : 'black' }}
                      >
                        <FontAwesomeIcon icon={faFilePdf} size="2x" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Select a user to view messages</p>
            )}
            <div ref={messagesEndRef} />
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <div className="input-group-append">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }} // Hide image file input
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="btn btn-secondary">
                    <FontAwesomeIcon icon={faImage} />
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    style={{ display: 'none' }} // Hide PDF file input
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="btn btn-secondary">
                    PDF
                  </label>
                  
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
