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
        .then((data) => setUsers(data))
        .catch((err) => console.error('Error fetching clients:', err));
    }
  }, [client]);

  useEffect(() => {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        setMessages((prevMessages) => [...prevMessages, data]);
        setNewMessage('');
        setImageFile(null);
        setPdfFile(null);
        scrollToBottom();
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

  // Inline styles for message bubbles
  const messageStyle = {
    color: 'black',
    padding: '10px',
    borderRadius: '5px',
    maxWidth: '75%',
    wordWrap: 'break-word',
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

          <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
            {selectedUser ? (
              messages.map((msg, index) => (
                <div key={index} className={`mb-2 d-flex ${msg.sender === client.clientId ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div>
                    {/* Message text */}
                    <span style={messageStyle}>
                      {msg.content || ''}
                    </span>

                    {/* Display the image below the text if it exists */}
                    {msg.image && (
                      <img
                        src={`http://localhost:5001/${msg.image}`}
                        alt="Sent"
                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '5px' }} // Display image below text
                      />
                    )}

                    {/* Display the file link below the image or text */}
                    {msg.file && !msg.image && (
                      <a
                        href={`http://localhost:5001/${msg.file}`}
                    
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faFilePdf} size="2x"/> 
                     
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
                    <FontAwesomeIcon icon={faFilePdf} />
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
