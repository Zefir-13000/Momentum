
# 📌 Momentum Project Overview

**Momentum** is a single-page web application (SPA), a modern, clean, and fully responsive web application designed to help you build and track your habits. This project was built with React to create a fast, dynamic, and engaging user experience from the ground up.  
The architecture is based on three main semantic blocks:  

- **Header** — responsive navigation bar (full menu on desktop, burger menu on mobile).  
- **Main** — dynamic content area with pages (HomePage, Login, Register) and an adaptive card grid.  
- **Footer** — minimalist footer with copyright information.  

The app uses **responsive design techniques** with Flexbox and CSS Grid, and includes smooth animations for improved user experience (UX).  

---

## 🛠 Technologies Used

- **React** — for building a SPA interface.  
- **CSS Grid & Flexbox** — for layout and adaptive alignment.  
- **Media Queries** (`@media`) with breakpoints at `480px`, `768px`, `968px`.  
- **Relative Units** (`rem`, `%`, `vh`) for scalable design.  
- **CSS Transitions** — for hover animations and menu effects.  
- **Git + GitHub** — version control and project hosting.  

---

## 📂 Project Structure

- `src/App.jsx` — root component orchestrating Header, Main, and Footer.  
- `src/pages/` — separate page components (HomePage, Login, Register).  
- `src/App.css` — global and adaptive styles.  
- `public/` — static assets.  

---

## 🚀 Local Setup

1. Navigate to the frontend directory:  
   ```bash
   cd frontend
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Start development server:  
   ```bash
   npm run dev
   ```

   The app will be available at:  
   👉 [http://localhost:5173](http://localhost:5173) (or another available port).  

---

## 🔑 Key Features

- **Responsive Navigation**  
  - Desktop: full navigation bar.  
  - Mobile: burger menu for compact display.  

- **Adaptive Card Grid**  
  - Uses `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` for flexible layouts.  

- **Smooth Animations**  
  - Hover effects for buttons and links.  
  - Animated mobile menu transitions.  

- **Modern Stack**  
  - React component structure.  
  - Adaptive CSS design.  
  - GitHub version control.  

---

## 📌 Conclusions

The result is a **ready-to-use prototype** of the Momentum web application, with well-structured architecture, modern design, and a fully adaptive interface.  
It can serve as a foundation for further development, such as server integration, analytics, or gamification.  