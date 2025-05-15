import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateUser } from '../api';
import type { User } from '../types';
import '../styles/login.css'; 
 
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user: User | null = await validateUser(email, password);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      navigate(`/${user.role}-dashboard`);
    } else {
      alert('Invalid credentials');
    }
  };
 
  return (
    <>
    <h1>Leave Management System</h1>
    <form onSubmit={handleLogin} className="login-container">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
    </>
  );
};
 
export default Login;
 