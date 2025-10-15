import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in local storage
        localStorage.setItem('token', data.token);

        // Fetch current user info and store it
        const meRes = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (meRes.ok) {
          const me = await meRes.json();
          localStorage.setItem('user', JSON.stringify(me));

          // Redirect based on role
          if (me.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/habits');
          }
        } else {
          // fallback: go to habits
          navigate('/habits');
        }
      } else {
        setError(data.message || data || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error logging in');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-form">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your momentum</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button onClick={handleSubmit} className="auth-button">Sign In</button>

          <p className="auth-switch">
            Don't have an account? <button onClick={() => navigate('/register')} className="link-button">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;