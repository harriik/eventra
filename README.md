# EVENTRA - Event Management System

A complete event management web application built with MERN stack.

## Features
- **Student**: Register, join teams, enroll in events
- **Coordinator**: Manage participants, mark attendance  
- **Admin**: Create events, assign coordinators, view analytics

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Quick Start

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend  
npm install
npm start
```

### Deployment
See `DEPLOY.md` for step-by-step hosting guide.

## Default Accounts
After seeding:
- Admin: `admin@eventra.com` / `Admin@123`
- Student: `student1@eventra.com` / `Student@123`

## Project Structure
```
eventra/
├── backend/          # Express.js API
├── frontend/         # React app
├── DEPLOY.md         # Deployment guide
└── README.md         # This file
```

Built with ❤️ using MERN Stack