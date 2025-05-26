import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateUserQuery } from '../services/userService'; // Import RTK Query hook
import type { User } from '../types';
import '../styles/login.css';

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
