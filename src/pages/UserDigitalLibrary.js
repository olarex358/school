// src/pages/UserDigitalLibrary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function UserDigitalLibrary() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Data from localStorage
  const [allDigitalResources] = useLocalStorage('schoolPortalDigitalLibrary', []);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect the route
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && (user.type === 'student' || user.type === 'staff')) {
      setLoggedInUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Derived state: Filter resources based on user role and class
  const userRelevantResources = allDigitalResources.filter(resource => {
    // Check if the user is in the correct audience
    const isCorrectAudience = resource.audience === 'all' || resource.audience === loggedInUser?.type;
    
    // Check if the user is in the correct class
    const isCorrectClass = resource.applicableClass === 'all' || resource.applicableClass === loggedInUser?.studentClass;

    return isCorrectAudience && isCorrectClass;
  });

  // Filter resources based on search term
  const filteredResources = userRelevantResources.filter(res =>
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.filename.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

  if (!loggedInUser) {
    return <div className="content-section">Access Denied. Please log in as a Student or Staff member.</div>;
  }

  return (
    <div className="content-section">
      <h1>Digital Library</h1>
      <p>Welcome, {loggedInUser.firstName || loggedInUser.firstname}! Here are the digital resources available to you.</p>
      
      <div className="sub-section">
        <h2>Available Resources</h2>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map(res => (
                  <tr key={res.id}>
                    <td>{res.title}</td>
                    <td>{res.description}</td>
                    <td>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert(`Simulating download of ${res.filename}`); }}>
                        {res.filename}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No digital resources found for you.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Back</button>
    </div>
  );
}

export default UserDigitalLibrary;