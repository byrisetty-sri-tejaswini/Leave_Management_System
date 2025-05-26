// src/components/ProfileMenu.tsx
import React, { useState } from 'react';
import '../styles/ProfileMenu.css';

interface ProfileMenuProps {
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);

  // Fetch user info from sessionStorage (adjust keys as per your app)
  const name = sessionStorage.getItem('name');
  const email = sessionStorage.getItem('email');
  const role = sessionStorage.getItem('role');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (showProfile) setShowProfile(false); // close profile box if menu closes
  };

  const handleViewProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
    setShowProfile(false);
  };

  return (
    <div className="profile-menu">
      <img
        src="path/to/profile-image.jpg" // replace with actual path or use avatar
        alt="Profile"
        className="profile-icon"
        onClick={toggleMenu}
      />
      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={handleViewProfile}>View Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Profile info box */}
      {showProfile && isOpen && (
        <div className="profile-info-box">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Role:</strong> {role}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
