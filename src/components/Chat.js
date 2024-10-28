import React, { useState, useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios'; 
import { 
  faImage, 
  faPaperPlane,
  faFilePdf, 
  faSearch, 
  faTimes, 
  faArrowUp, 
  faArrowDown 
} from '@fortawesome/free-solid-svg-icons';
import BASE_URL from '../config';

const Chat = () => {
  const { client } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [searchCount, setSearchCount] = useState(0);
  const [query, setQuery] = useState('');   // State for search input
    const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const messageRefs = useRef({});
  const socket = useMemo(() => io('http://localhost:3000', { 
    auth: { token: localStorage.getItem('jwt_token') } 
  }), []);

  // Fetch users when component mounts
  useEffect(() => {
    if (client) {
      fetch('http://localhost:5001/api/client/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => res.json())
        .then(async (data) => {
          const filteredUsers = data.filter(user => user._id !== client.clientId);
          setUsers(filteredUsers)
          const usersWithProfiles = await Promise.all(
            filteredUsers.map(async (user) => {
              const profileResponse = await fetch(`http://localhost:5001/api/client/profile/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              });
              const profileData = await profileResponse.json();

              return {
                ...user,
                profilePicture: profileData.profileImage || '/profile.jpg',
              };
            })
          );
        
          setUsers(usersWithProfiles);
        })
        .catch((err) => console.error('Error fetching clients:', err));
    }
  }, [client]);

  

  // Fetch messages for selected user
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

  // Handle real-time messages and fetch initial messages
  useEffect(() => {
    fetchMessages();

    socket.on('chat message', (msg) => {
      if (
        (msg.sender === selectedUser?._id || msg.receiver === selectedUser?._id) &&
        (msg.sender === client?.clientId || msg.receiver === client?.clientId)
      ) {
        setMessages((prevMessages) => [...prevMessages, msg]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('chat message');
    };
  }, [selectedUser, client, socket]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedUser || !client) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/search/${client.clientId}/${selectedUser._id}/${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` },
        }
      );

      const data = await response.json();
      setSearchResults(data);
      setSearchCount(data.length);
      setCurrentSearchIndex(data.length > 0 ? 0 : -1);
      
      // Scroll to first result if exists
      if (data.length > 0) {
        scrollToMessage(0);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const scrollToMessage = (index) => {
    if (searchResults[index]) {
      const messageId = searchResults[index]._id;
      messageRefs.current[messageId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setCurrentSearchIndex(index);
    }
  };

  const goToPreviousResult = () => {
    if (currentSearchIndex > 0) {
      scrollToMessage(currentSearchIndex - 1);
    }
  };

  const goToNextResult = () => {
    if (currentSearchIndex < searchResults.length - 1) {
      scrollToMessage(currentSearchIndex + 1);
    }
  };


  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    fetchMessages();
  };

   // Fetch all users on component mount
   useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users'); // Adjust to your users route
            setUsers(response.data);
            setFilteredUsers(response.data); // Initially set filtered users to all users
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    fetchUsers();
}, []);

// Handle search input change
const handleSearche = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setQuery(searchQuery);

    // Filter users based on search query
    const filtered = users.filter(user =>
        user.clientname.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
    );
    setFilteredUsers(filtered);
};
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPdfFile(null);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setImageFile(null);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  // Send message function
  const sendMessage = async () => {
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

    try {
      const response = await fetch('http://localhost:5001/api/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      socket.emit('chat message', data);
      fetchMessages();
      setNewMessage('');
      setImageFile(null);
      setPdfFile(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message: ' + error.message);
    }
  };

 // Update the renderMessage function to highlight searched words
const renderMessage = (msg, index) => {
  // Function to highlight the search term
  const highlightText = (text) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: '#ffc107', fontWeight: 'bold' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      key={index}
      className={`mb-2 d-flex ${msg.sender === client?.clientId ? 'justify-content-end' : 'justify-content-start'}`}
    >
      <div
        className={`message-bubble ${msg.sender === client?.clientId ? 'sent' : 'received'}`}
        style={{
          backgroundColor: msg.sender === client?.clientId ? '#007bff' : '#e0e0e0',
          color: msg.sender === client?.clientId ? 'white' : 'black',
          padding: '10px',
          borderRadius: '10px',
          maxWidth: '60%',
          position: 'relative',
        }}
      >
        <span style={{ display: 'block', marginBottom: '5px' }}>
          {highlightText(msg.content || '')}
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
            style={{ color: msg.sender === client?.clientId ? 'white' : 'black' }}
          >
            <FontAwesomeIcon icon={faFilePdf} size="2x" />
          </a>
        )}
      </div>
    </div>
  );
};


  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* Users List */}
        <div className="col-md-3 border-right bg-light p-3">
            <h5 className="border-bottom pb-2">Users</h5>
            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={handleSearche}
                className="form-control mb-3" // Bootstrap class for styling
            />
            <ul className="list-group">
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className={`list-group-item d-flex align-items-center ${selectedUser && selectedUser._id === user._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`${BASE_URL}/uploads/${user.profilePicture}` || '/profile.jpg'}
                  alt={`${user.clientname}'s profile`}
                  className="rounded-circle"
                  style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }} // Add marginRight
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.clientname}</span> {/* Increase font size and add bold */}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 d-flex flex-column">
          {/* Chat Header */}
          <div className="border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {selectedUser ? `Chat with ${selectedUser.clientname}` : 'Select a user to start chatting'}
            </h5>
            {selectedUser && (
              <div className="d-flex align-items-center">
                <div className="input-group" style={{ maxWidth: '400px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <div className="input-group-append">
                    {isSearching && (
                      <>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={goToPreviousResult}
                          disabled={currentSearchIndex <= 0}
                        >
                          <FontAwesomeIcon icon={faArrowUp} />
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={goToNextResult}
                          disabled={currentSearchIndex >= searchResults.length - 1}
                        >
                          <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                        <span className="btn btn-outline-secondary disabled">
                          {searchCount > 0 ? `${currentSearchIndex + 1}/${searchCount}` : '0/0'}
                        </span>
                        <button 
                          className="btn btn-outline-secondary" 
                          onClick={clearSearch}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    )}
                    {!isSearching && (
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={handleSearch}
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Messages Area */}
          <div 
            className="flex-grow-1 overflow-auto p-3" 
            style={{ backgroundColor: '#f8f9fa', maxHeight: '600px', overflowY: 'scroll' }}
          >
            {selectedUser ? (
              (isSearching ? searchResults : messages).map((msg, index) => renderMessage(msg, index))
            ) : (
              <p className="text-center text-muted mt-3">Select a user to view messages</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
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
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="btn btn-secondary">
                    <FontAwesomeIcon icon={faImage} />
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    style={{ display: 'none' }}
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="btn btn-secondary">
                    <FontAwesomeIcon icon={faFilePdf} />
                  </label>

                  <button className="btn btn-primary" onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} />
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