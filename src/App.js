import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import PrivateRoute from './PrivateRoute'
import Chat from './components/Chat';


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
                            {/* Protect the chat route */}
                                <Route path="/chat" element={
                                  <PrivateRoute>
                                    <Chat />
                                  </PrivateRoute>

                   } />         
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
