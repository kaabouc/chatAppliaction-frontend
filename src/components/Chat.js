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
  const [imageFile, setImageFile] = useState(null);  // Separate state for image
  const [pdfFile, setPdfFile] = useState(null);      // Separate state for PDF
  const messagesEndRef = useRef(null);
  const socket = useMemo(() => io('http://localhost:5001', { auth: { token: localStorage.getItem('jwt_token') } }), []);
  

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
      // Fetch initial messages from the server for the selected user
      fetch(`http://localhost:5001/api/messages/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Fetched messages:', data);
          // Filter messages between the current client and the selected user
          const filteredMessages = data.filter(
            (message) =>
              (message.sender === client.clientId && message.receiver === selectedUser._id) ||
              (message.sender === selectedUser._id && message.receiver === client.clientId)
          );
          setMessages(filteredMessages);
          scrollToBottom(); // Scroll to the bottom when messages are loaded
        })
        .catch((err) => console.error('Error fetching messages:', err));
  
      // Handle real-time messages via socket
      socket.on('chat message', (msg) => {
        console.log('Socket received message:', msg);
        if (
          (msg.sender === selectedUser._id || msg.receiver === selectedUser._id) &&
          (msg.sender === client.clientId || msg.receiver === client.clientId)
        ) {
          setMessages((prevMessages) => [...prevMessages, msg]);
          scrollToBottom(); // Scroll when new message is received
        }
      });
  
      return () => {
        socket.off('chat message'); // Clean up listener when component unmounts or user changes
      };
    }
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
        setImageFile(null); // Clear the image file after sending
        setPdfFile(null);   // Clear the PDF file after sending
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
      <div key={index} className={`mb-2 ${msg.sender === client.clientId ? 'text-right' : 'text-left'}`}>
        {/* Text Message */}
        {msg.content && (
          <span className={`badge badge-${msg.sender === client.clientId ? 'primary' : 'secondary'} p-2`}>
            {msg.content}
          </span>
        )}

        {/* Image Message */}
        {msg.image && (
          <div>
            <img src={`http://localhost:5001/${msg.image}`} alt="Sent Image" style={{ maxWidth: '200px' }} />
          </div>
        )}

        {/* PDF File */}
        {msg.file && (
          <div>
            <a href={`http://localhost:5001/${msg.file}`} target="_blank" rel="noopener noreferrer">
              Download PDF
            </a>
          </div>
        )}
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
