import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import HomePage from './HomePage';
import './App.css'; // Import the new CSS file

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app">
      <header className="header">
        <nav className="navbar">
          <button onClick={() => navigateTo('home')} className="logo">
            <span className="logo-icon">⚡</span>
            Momentum
          </button>
          
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><button onClick={() => navigateTo('home')}>Home</button></li>
            <li><button onClick={() => scrollToSection('about')}>About</button></li>
            <li><button onClick={() => scrollToSection('features')}>Features</button></li>
            <li><button onClick={() => scrollToSection('contact')}>Contact</button></li>
            <li className="nav-auth-buttons">
              <button onClick={() => navigateTo('login')} className="nav-signin">Sign In</button>
              <button onClick={() => navigateTo('register')} className="nav-signup">Sign Up</button>
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
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'login' && <Login navigateTo={navigateTo} />}
        {currentPage === 'register' && <Register navigateTo={navigateTo} />}
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