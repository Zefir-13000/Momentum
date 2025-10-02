# Momentum React App

This is a single-file responsive React application named "Momentum" featuring a Header with a responsive navigation bar (burger menu on mobile), a Main content area with an adaptive grid of cards, and a Footer.

## Setup Instructions

To run this project locally, follow these steps:

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

## Project Structure

-   `src/App.jsx`: The main React component containing the Header, Main content, and Footer.
-   `src/App.css`: Contains all the styling for the application, including responsive design and hover effects.
-   `public/`: Static assets.

## Features

-   **Responsive Header:** Navigation bar transforms into a functional burger menu on smaller screens.
-   **Adaptive Card Grid:** Main content displays a grid of cards that rearranges for desktop, tablet, and mobile views using CSS Grid.
-   **Relative CSS Units:** `rem` and `%` units are used for better responsiveness.
-   **Hover Transitions:** Simple hover effects are applied to interactive elements.
