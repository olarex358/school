// src/pages/UserDigitalLibrary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

// Import a generic library icon for the card
import libraryIcon from '../icon/library.png'

function UserDigitalLibrary() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Load digital resources, students, and subjects from backend
  const [digitalResources, , loadingResources] = useLocalStorage('schoolPortalDigitalLibrary', [], 'http://localhost:5000/api/schoolPortalDigitalLibrary');
  const [students] = useLocalStorage('schoolPortalStudents', [], 'http://localhost:5000/api/schoolPortalStudents');
  
  const [userResources, setUserResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the route and filter resources
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'student' || user.type === 'staff')) {
      setLoggedInUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (loggedInUser && digitalResources.length > 0) {
      const filteredForUser = digitalResources.filter(resource => {
        // First filter by general audience type (all or specific user type)
        const isCorrectAudience = resource.audience === 'all' || resource.audience === loggedInUser.type;
        
        // Then, if it's for students, check if the class matches
        if (loggedInUser.type === 'student' && loggedInUser.studentClass) {
          const isCorrectClass = resource.applicableClass === 'all' || resource.applicableClass === loggedInUser.studentClass;
          return isCorrectAudience && isCorrectClass;
        }

        // For staff, no further filtering is applied for now
        return isCorrectAudience;
      }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setUserResources(filteredForUser);
    } else {
      setUserResources([]);
    }
  }, [loggedInUser, digitalResources]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/home');
  };

  const filteredAndSearchedResources = userResources.filter(res =>
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!loggedInUser || loadingResources) {
    return <div className="content-section">Loading digital library...</div>;
  }
  
  return (
    <div className="content-section">
      <h1>Digital Library</h1>
      <p>Welcome, {loggedInUser.type === 'student' ? loggedInUser.firstName : loggedInUser.firstname}! Here are the digital resources available to you:</p>

      <div className="sub-section">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
        {filteredAndSearchedResources.length > 0 ? (
          <div className="cards-container">
            {filteredAndSearchedResources.map(res => (
              <div key={res._id} className="card-item-container">
                <div className="card-item-icon">
                    <img src={libraryIcon} alt="Resource Icon" width="50px" height="50px" />
                </div>
                <div className="card-item-content">
                    <h4>{res.title}</h4>
                    <p>{res.description}</p>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of ${res.filename}`); }}>
                        Download: {res.filename}
                    </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No digital resources match your search or are currently available.</p>
        )}
      </div>

      <p style={{ marginTop: '20px' }}>
        If you have questions about any of the resources, please contact the school administration.
      </p>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
    </div>
  );
}

export default UserDigitalLibrary;