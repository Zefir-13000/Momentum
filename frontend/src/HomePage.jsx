import React from 'react';

function HomePage({ navigateTo }) {
  return (
    <>
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Unlock Your Potential with Momentum</h1>
          <p className="hero-subtitle">Start building powerful habits today. Track your progress, stay motivated with gamification, and achieve your goals faster.</p>
          <div className="hero-buttons">
            <button onClick={() => navigateTo('register')} className="button primary">Get Started Free</button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="button secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-card card-1">📊</div>
          <div className="floating-card card-2">🎯</div>
          <div className="floating-card card-3">⭐</div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Build Better Habits</h2>
          <p>Momentum provides all the tools you need to create lasting change</p>
        </div>
        
        <div className="card-grid">
          <div className="card">
            <div className="card-icon">📝</div>
            <h3>Habit Creation</h3>
            <p>Easily create and define new habits with customizable goals and reminders. Start your journey to a better you today!</p>
          </div>
          <div className="card">
            <div className="card-icon">📈</div>
            <h3>Tracking & Analysis</h3>
            <p>Monitor your progress with intuitive tracking tools and insightful analytics. Visualize your consistency and identify areas for improvement.</p>
          </div>
          <div className="card">
            <div className="card-icon">🏆</div>
            <h3>Gamification Elements</h3>
            <p>Stay motivated with engaging gamification features. Earn points, unlock achievements, and compete with friends to make habit-building fun.</p>
          </div>
          <div className="card">
            <div className="card-icon">🧑‍💻</div>
            <h3>Multi-User Roles</h3>
            <p>Supports various user roles including Guest, User, and Administrator, each with tailored functionalities and access levels.</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          <h2>Why Choose Momentum?</h2>
          <p>Building habits shouldn't feel like a chore. Momentum combines proven behavioral science with modern gamification to make personal growth engaging and sustainable. Join thousands of users who are already transforming their lives, one habit at a time.</p>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-content">
          <h2>Get in Touch</h2>
          <p>Have questions? We'd love to hear from you. Reach out to our team and we'll respond as soon as possible.</p>
          <button onClick={() => navigateTo('register')} className="button primary">Join Today</button>
        </div>
      </section>
    </>
  );
}

export default HomePage;