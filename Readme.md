# **Task Management Application**

This is a Task Management Application built with a MERN stack. The front end is developed using React with Vite, and the back-end is built using Express.js with MongoDB for the database.

---

<p align="center">
  <b style="color: blue;  ">Visitor count</b>
  <br>
  <a style="" href="https://github.com/akashdeep023">
  <img src="https://profile-counter.glitch.me/task-management/count.svg" />
  </a>
</p>

## 📜 Project Overview

_A task management app, where users can organize their personal and team-based tasks, track progress, and share task updates. Users can manage their task boards with features to create, edit, assign, and delete tasks for themselves and other members._

<p align="center">Register Page</p>
<a style="" href="https://task-management-org.vercel.app/login">
     
![Macbook-Air-localhost (1)](https://github.com/user-attachments/assets/d05bd3e9-e349-469b-a4d2-d828e3e76414)

</a>
<p align="center">Dashboard Page</p>
<a style="" href="https://task-management-org.vercel.app/">
     
![Macbook-Air-localhost](https://github.com/user-attachments/assets/5643d5a6-b8ad-4516-a3dd-d12b0d9793e3)

</a>
<p align="center">Public View</p>
<a style="" href="https://task-management-org.vercel.app/task/67421bb3a90e252d2d4cb42e">
     
![Macbook-Air-localhost (2)](https://github.com/user-attachments/assets/cde4fcb3-80c4-410d-9763-50281c9b2233)

</a>

## **Table of Contents**

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Setup Instructions](#setup-instructions)
-   [Scripts](#scripts)
-   [Live Demo](#live-demo)
-   [Author](#author)
-   [License](#license)

---

## **Features**

-   User authentication using JWT.
-   Secure password handling with bcrypt.js.
-   State management with Redux Toolkit.
-   User-friendly interface and Only public page Responsive.
-   Toast notifications for feedback.
-   RESTful APIs for seamless communication between frontend and backend.

### **Core Functionalities**

-   **User Authentication:**

    -   Users can register and log in.
    -   Only authenticated users can create and manage tasks.

-   **Task Management:**

    -   Create tasks with properties like priority, optional due dates, categories, and the ability to share tasks with others (read-only public access for shared tasks).
    -   Update tasks, including title, priority, and due dates.
    -   Delete tasks.
    -   Change task statuses across four categories: **Backlog**, **To-Do**, **In-Progress**, and **Done**.
    -   Automatically highlight overdue tasks with red and completed tasks with green.

-   **User Management:**

    -   Users can update their name, email, or password via the settings page.
    -   Changes to email or password will log users out to ensure security.

-   **Analytics & Filtering:**

    -   Review task analytics in a dedicated section.
    -   Filter tasks by **Today**, **This Week**, or **This Month** (default is the current week).

-   **User-Friendly Interface:**

    -   Task titles are truncated on the board for readability, with full titles accessible via tooltips.
    -   Mandatory fields are marked with a red asterisk (\*).
    -   Notifications and alerts are provided via toast messages.

-   **Collaboration:**
    -   Add members to task boards.
    -   Assign members to tasks during creation.

### **Additional Features**

-   Visual indicators for task statuses based on due dates:
    -   **Red**: Overdue tasks in active categories.
    -   **Green**: Tasks marked as done.
-   Pre-filled user information for seamless updates on the settings page.

## 🛠️ **Tech Stack**

### **Frontend**

-   **React**: UI library.
-   **React Router DOM**: For routing.
-   **Redux Toolkit**: State management.
-   **React Icons**: Icon library.
-   **React Toastify**: Notification handling.
-   **Vite**: Frontend build tool.
-   **Eslint**: Code quality and linting.

### **Backend**

-   **Express.js**: Backend framework.
-   **Mongoose**: MongoDB object modeling.
-   **JWT**: Secure token-based authentication.
-   **Bcrypt.js**: Password encryption.
-   **Dotenv**: Environment variable management.
-   **Cors**: Cross-origin resource sharing.

---

## **Setup Instructions**

### **Prerequisites**

-   Install **Node.js (18.17.1)**.
-   Install **npm** or **yarn**.
-   MongoDB database.

### **Backend Setup**

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the backend directory and add:
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/task_management
    FRONTEND_URL=http://localhost:5173
    PORT=9000
    JWT_SECRET=secret-kJKJllKKJJghLjOiUfcHGkMLgdJlLKDtrdyKLBJbRdesEkj
    ```
4. Start the server in development mode:
    ```bash
    npm run dev
    ```

### **Frontend Setup**

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the frontend directory and add:
    ```env
    VITE_BACKEND_URL=http://localhost:9000
    VITE_FRONTEND_URL=http://localhost:5173
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
5. Open the application in your browser at `http://localhost:5173`.

---

## **Scripts**

### **Frontend**

| Script            | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Starts the development server.              |
| `npm run build`   | Builds the production version of the app.   |
| `npm run lint`    | Lints the codebase for errors and warnings. |
| `npm run preview` | Previews the built application.             |

### **Backend**

| Script          | Description                                          |
| --------------- | ---------------------------------------------------- |
| `npm run start` | Starts the server in production mode.                |
| `npm run dev`   | Starts the server in development mode using nodemon. |

---

## **Live Demo**

Check out the live demo of Task Management here: [Task Management](https://task-management-org.vercel.app)

## **Author**

Akash Deep \
Email: contact.akashdeep023@gmail.com \
LinkedIn: https://www.linkedin.com/in/akashdeep023/

## **Contributors**

We'd like to acknowledge the efforts and contributions of the following individuals:

-   **[Akash Deep](https://github.com/akashdeep023)** - Full Stack development and Project lead.
-   **[Ekant Verma](https://github.com/ekantverma)** - Full Stack development.
-   **[Anjali Kumari](https://github.com/Anjali17aj)** - Full Stack development.
-   **[Shanedra Singh](https://github.com/shanedraSingh/)** - Full Stack development.

## **License**

This project is licensed under the [MIT License](LICENSE).

---

Thank you for checking out my Task Management project! If you have any feedback or suggestions, I would love to hear from you.
Feel free to contribute, report issues, or suggest improvements! 😊
