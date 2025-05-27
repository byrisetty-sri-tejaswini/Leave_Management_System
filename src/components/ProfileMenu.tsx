// src/components/ProfileMenu.tsx
import React, { useState } from 'react';
import '../styles/ProfileMenu.css';
interface ProfileMenuProps {
    onLogout: () => void;
}
/**
* @description ProfileMenu component for displaying user profile options.
* It allows users to view their profile information and log out.
* @component
* @example
* return (
*   <ProfileMenu onLogout={handleLogout} />
* );
* @property {Function} onLogout - Function to handle user logout.
* @param {any} props - The properties for the ProfileMenu component.
* @returns {JSX.Element} The rendered ProfileMenu component.
*/
const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    // Fetch user info from sessionStorage (adjust keys as per your app)
    const name = sessionStorage.getItem('name');
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');
    const id = sessionStorage.getItem('id');
    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (showProfile)
            setShowProfile(false);
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
            <img src="/assets/profile-user.png" className="profile-icon" onClick={toggleMenu} />
            {isOpen &&
                (
                    <div className="dropdown-menu">
                        <button onClick={handleViewProfile}>View Profile</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                )
            }

            {showProfile && isOpen &&
                (
                    <div className="profile-info-box">
                        <p><strong>Name:</strong> {name}</p>
                        <p><strong>Id:</strong>{id}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Role:</strong> {role}</p>
                    </div>
                )
            }
        </div>
    );
};
export default ProfileMenu;
