# EVENTRA - Multi-Role Symposium Event Management Web App

A comprehensive event management system built with MERN stack (MongoDB, Express, React, Node.js) for managing symposium events with multi-role support (Student, Coordinator, Admin).

## Features

### Student Module
- User registration and login
- Browse available symposium events
- Enroll in multiple events
- View enrolled events with participant IDs
- Track attendance status

### Coordinator Module
- Login and view assigned events
- View participants for each event
- Mark attendance (Present/Absent/NotMarked)
- View attendance statistics and summaries

### Admin Module
- Create main events (symposiums)
- Create sub-events under symposiums
- Assign coordinators to events
- View all participants with filters
- View event-wise enrollment and attendance statistics
- Comprehensive dashboard with analytics

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
eventra/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Seed data script
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── public/          # Public assets
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventra
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Make sure MongoDB is running on your system, or update `MONGODB_URI` with your MongoDB Atlas connection string.

5. Seed the database with sample data (optional but recommended):
```bash
npm run seed
```

This will create:
- Admin user: `admin@eventra.com` / `admin123`
- Coordinator user: `coordinator1@eventra.com` / `coord123`
- Student user: `student1@eventra.com` / `student123`
- Sample events and sub-events

6. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `GET /api/events/main/:mainEvent` - Get sub-events
- `POST /api/events` - Create main event (Admin)
- `POST /api/events/sub-events` - Create sub-event (Admin)

### Registrations
- `POST /api/registrations` - Enroll in event (Student)
- `GET /api/registrations/my-registrations` - Get my registrations (Student)
- `GET /api/registrations/event/:eventId/participants` - Get event participants (Coordinator/Admin)
- `GET /api/registrations/all` - Get all registrations (Admin)

### Attendance
- `POST /api/attendance/mark` - Mark attendance (Coordinator)
- `GET /api/attendance/event/:eventId` - Get event attendance (Coordinator/Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/events/stats` - Get event statistics (Admin)

## Database Schema

### Users
- id, name, email, password (hashed), role, mobile, college, created_at

### Events
- event_id, main_event, title, description, date, venue, coordinator_id, created_at

### Registrations
- registration_id, user_id, event_id, participant_id, timestamp

### Attendance
- attendance_id, registration_id, status (Present/Absent/NotMarked), marked_at, marked_by

### Colleges (Optional)
- college_id, name, slug, theme, logo

## Participant ID Format

Participant IDs are automatically generated in the format: `EVT2025_<5 digit number>`

Example: `EVT2025_00001`, `EVT2025_00002`, etc.

## Default Test Accounts

After running the seed script:

- **Admin**: admin@eventra.com / admin123
- **Coordinator**: coordinator1@eventra.com / coord123
- **Student**: student1@eventra.com / student123

## Usage

1. **Student Flow**:
   - Register/Login as a student
   - Browse events from the dashboard
   - Click on an event to view details
   - Enroll in events
   - View enrolled events and participant IDs

2. **Coordinator Flow**:
   - Login as a coordinator
   - View assigned events
   - View participants for each event
   - Mark attendance (Present/Absent)
   - View attendance statistics

3. **Admin Flow**:
   - Login as admin
   - Create main events (symposiums)
   - Create sub-events under symposiums
   - Assign coordinators to events
   - View all participants and registrations
   - View comprehensive reports and statistics

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `EMAIL_HOST` - SMTP server host (default: smtp.gmail.com)
- `EMAIL_PORT` - SMTP server port (default: 587)
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASSWORD` - Email password or app password (for Gmail, use App Password)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Security Features

- Passwords are hashed using bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes with middleware
- Input validation using express-validator

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

## Production Build

### Frontend Build
```bash
cd frontend
npm run build
```

The build folder will contain the production-ready React app.

### Backend Production
```bash
cd backend
npm start  # Uses node server.js
```

## Troubleshooting

1. **MongoDB Connection Error**: Make sure MongoDB is running or update the connection string in `.env`
2. **Port Already in Use**: Change the PORT in backend `.env` file
3. **CORS Errors**: Ensure the backend CORS is configured correctly
4. **Authentication Issues**: Check JWT_SECRET is set in backend `.env`

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack**


