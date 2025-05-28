import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateUserQuery } from '../services/userService'; // Import RTK Query hook
import type { User } from '../types';
import '../styles/login.css';
/**
* @description Login component for user authentication.
* It allows users to enter their email and password to log in.
* If the credentials are valid, it redirects to the user's dashboard based on their role.
* @component
* @example
* return (
*   <Login />
* );
* @returns {JSX.Element} The rendered Login component.
*/
const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { data: user, isLoading, isError, refetch } = useValidateUserQuery({ email, password }, { skip: !email || !password }); // Fetch user using RTK Query
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            sessionStorage.setItem('user', JSON.stringify(user));
            // After successful login
            sessionStorage.setItem('id', user.id);
            sessionStorage.setItem('name', user.name);
            sessionStorage.setItem('email', user.email);
            sessionStorage.setItem('role', user.role);
            navigate(`/${(user.role).toLowerCase()}-dashboard`);
        }
        else {
            alert('Invalid credentials');
        }
    };
    return (<>
    <div className="login">
    <div className="left-container">
        <img src="/assets/name.png" alt="Logo" className="logo" />
    </div>
    <div className="right-container">
      <div className='content'>
      <form onSubmit={handleLogin} className="login-container">
        <img src="/assets/logo.jpg" alt="Logo" className="logo" />
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button type="submit">Login</button>
      </form>
      </div>
    </div>
    </div>
    </>);
};
export default Login;
