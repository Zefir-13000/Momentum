import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import HomePage from './HomePage';
import AdminPanel from './AdminPanel';
import Habits from './Habits';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    user = null;
  }

  const isAuthenticated = !!token;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="app">
      <header className="header">
        <nav className="navbar">
          <button onClick={() => handleNavigate('/')} className="logo">
            <span className="logo-icon">⚡</span>
            Momentum
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><button onClick={() => handleNavigate('/')}>Home</button></li>
            <li><button onClick={() => scrollToSection('about')}>About</button></li>
            <li><button onClick={() => scrollToSection('features')}>Features</button></li>
            <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
            <li className="nav-auth-buttons">
              {!isAuthenticated ? (
                <>
                  <button onClick={() => handleNavigate('/login')} className="nav-signin">Sign In</button>
                  <button onClick={() => handleNavigate('/register')} className="nav-signup">Sign Up</button>
                </>
              ) : (
                <>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleNavigate('/admin')} className="nav-admin">Admin</button>
                  )}
                  <button onClick={() => handleNavigate('/habits')} className="nav-habits">Habits</button>
                  <button onClick={handleLogout} className="nav-signout">Sign Out</button>
                </>
              )}
            </li>
          </ul>

          <button className={`burger-menu ${isMenuOpen ? 'toggle' : ''}`} onClick={toggleMenu}>
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
          </button>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage navigateTo={(p) => handleNavigate(p)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/habits" element={isAuthenticated ? <Habits /> : <Login />} />
          <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Login />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">⚡</span>
            <span>Momentum</span>
          </div>
          <p>&copy; 2025 Momentum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;