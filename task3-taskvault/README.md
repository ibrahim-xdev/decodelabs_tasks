# TaskVault

TaskVault is a simple full-stack Task Management System built with HTML, CSS, JavaScript, Node.js, Express.js, and MySQL. It demonstrates how a frontend connects to a backend API and database to perform basic CRUD operations.

## Features

- Create, view, edit, and delete tasks
- Mark tasks as pending/completed
- Filter tasks by status
- Set due dates
- Store tasks permanently in MySQL

## Live Link
https://taskvault-frontend-ossb.onrender.com/

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **API:** REST API

## How to Run

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskVault
```

### 2. Set up MySQL

Create a database named `taskvault` and run the SQL schema provided in the `database` folder.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure `.env`

Create a `.env` file inside `backend`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskvault
```

### 5. Start the backend

```bash
npm run dev
```

The API will run at:

```
http://localhost:5000
```

### 6. Run the frontend

Open `frontend/index.html` using VS Code Live Server.

## Data Flow

```
HTML/CSS/JS
     ↓
Express.js API
     ↓
    MySQL
```

Explain
