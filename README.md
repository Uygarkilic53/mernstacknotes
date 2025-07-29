# mernstacknotes
 A notes app built with MERN stack
-----

# MERN Stack Notes Application

This is a full-stack notes application built using the MERN (MongoDB, Express.js, React, Node.js) stack. It allows users to create, view, edit, delete, and organize their notes with features like tagging and pinning. User authentication is also included.

## Features

  * **User Authentication:** Secure user registration and login functionality.
  * **Dashboard:** A personalized dashboard displays all notes added by the logged-in user.
  * **Note Management:**
      * **Add Notes:** Easily create new notes using a dedicated "Add" button at the bottom of the dashboard.
      * **Edit Notes:** Modify existing notes to update their content.
      * **Delete Notes:** Remove unwanted notes.
      * **Pin Notes:** Mark important notes for quick access or visibility.
      * **Tags:** Organize notes by adding custom tags.
      * **Creation Date:** View the exact date each note was created.
  * **User Profile in Navbar:**
      * A rounded profile icon displaying the first letter of the user's name.
      * User's name displayed next to the profile icon.
      * Convenient **Logout** button.

## Technologies Used

  * **Frontend:** React.js
  * **Backend:** Node.js, Express.js
  * **Database:** MongoDB
  * **Authentication:** JSON Web Tokens (JWT)

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

  * Node.js and npm (or yarn) installed
  * MongoDB Atlas account (or a local MongoDB instance)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <https://github.com/Uygarkilic53/mernstacknotes.git>
    cd <mernstacknotes>
    ```

2.  **Backend Setup:**

    Navigate to the `backend` directory and install dependencies:

    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the root of the `backend` folder with the following environment variables:

    ```
    PORT=8000
    MONGO_URI=your_mongodb_connection_string_here
    ACCESS_TOKEN_SECRET=your_jwt_secret_here
    ```

      * `PORT`: The port your backend server will run on (e.g., `8000`).
      * `MONGO_URI`: Your MongoDB connection string. You can get this from MongoDB Atlas.
      * `ACCESS_TOKEN_SECRET`: A strong, random string used for signing JWTs. You can generate one using a tool or by writing a short script.

3.  **Frontend Setup:**

    Navigate to the `frontend` directory and install dependencies:

    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**

    From the `backend` directory:

    ```bash
    npm start
    ```

    The server will run on the port specified in your `.env` file (e.g., `http://localhost:8000`).

2.  **Start the Frontend Application:**

    From the `frontend` directory:

    ```bash
    npm run dev
    ```

    The React application will open in your browser (http://localhost:5173/)

-----
