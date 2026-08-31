# Noto

> **Where thoughts take shape.**

Noto is a full-stack note-taking web application built with React and Node.js. It provides a clean and responsive interface for creating, editing, organizing, searching, and managing personal notes.

## Features

- User registration and login
- Secure JWT authentication
- HTTP-only cookie-based authentication
- Session management and session restoration
- Protected routes and API endpoints
- Secure logout
- Password hashing with bcrypt
- Create, edit, and delete notes
- Star and unstar notes
- Starred notes section
- Search notes
- Rich-text editing with Tiptap
- Relative date formatting
- User profile
- Light and dark themes
- Responsive desktop and mobile layouts
- Desktop profile drawer and mobile profile screen
- Loading, empty, and error states
- Backend input validation using Zod
- RESTful API architecture
- PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Tiptap
- Lucide React
- date-fns

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod

### Testing & Code Quality
- Jest
- Mocha
- Chai
- SonarQube
- CodeRabbit
- Git & GitHub

## Architecture

```text
React UI
   ↓
Axios API Layer
   ↓
Express REST API
   ↓
Authentication Middleware
   ↓
Controllers
   ↓
Services
   ↓
Prisma ORM
   ↓
PostgreSQL
```

The application follows separation of concerns between UI components, API services, controllers, business logic, validation, and database access.

## Authentication & Session Management

Noto uses JWT-based authentication with **HTTP-only cookies** instead of storing authentication tokens in localStorage.

```text
Login
  ↓
Backend validates credentials
  ↓
JWT generated
  ↓
HTTP-only cookie
  ↓
Browser manages session
  ↓
Protected API requests
```

The authenticated session can be restored after a page refresh through the current-user API.

Logout clears the authentication cookie and the frontend authentication state.

## Notes

Users can:

- Create notes
- Edit notes
- Delete notes
- Search notes
- Star and unstar notes
- View starred notes
- Format notes using the rich-text editor

Notes are associated with the authenticated user and stored in PostgreSQL.

## Search

Search is handled through the dashboard and connected to the backend search API.

```text
Topbar
   ↓
Dashboard
   ↓
NotesScreen
   ↓
Notes Service
   ↓
Search API
   ↓
PostgreSQL
```

## Responsive Design

Noto provides responsive layouts for different screen sizes.

### Desktop
- Sidebar navigation
- Top search bar
- Theme toggle
- User profile button
- Profile side drawer
- Responsive notes grid

### Mobile
- Mobile navigation
- Hamburger menu
- Full-screen profile
- Responsive search
- Mobile-friendly note cards

## Validation & Error Handling

Backend requests are validated using **Zod** before reaching the business logic.

The application also includes:

- Centralized backend error handling
- Frontend API error handling
- Loading states
- Empty states
- Validation errors
- User-friendly error messages

## Testing & Code Quality

The project includes automated testing using **Jest, Mocha, and Chai**.

**SonarQube** is used for:

- Code quality analysis
- Code smells
- Bugs
- Security issues
- Maintainability
- Test coverage

The project currently maintains approximately **86% code coverage** reported through SonarQube.

**CodeRabbit** is used for automated pull-request code reviews and quality checks.

## Git Workflow

```text
Update main
   ↓
Create feature branch
   ↓
Implement feature
   ↓
Write tests
   ↓
Run tests & coverage
   ↓
Run SonarQube
   ↓
Commit & Push
   ↓
Open Pull Request
   ↓
CodeRabbit Review
   ↓
Fix Review Comments
   ↓
Mentor Review
   ↓
Merge
```

## Project Structure

```text
Noto/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       └── services/
│
└── backend/
    ├── controllers/
    ├── middlewares/
    ├── routes/
    ├── services/
    ├── validators/
    ├── prisma/
    ├── app.js
    └── server.js
```

## Running the Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:3005
```

## Environment Variables

Create the required environment files locally.

```env
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
JWT_SECRET=your_jwt_secret
```

Do not commit secrets or database credentials to the repository.

## Future Improvements

- Trash and restore functionality
- Permanent note deletion
- Improved search and filtering
- User profile editing
- Additional account settings
- CI/CD pipeline
- Production deployment

## Author

**Wajahat Nazir**
