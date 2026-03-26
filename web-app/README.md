# Fartech TimeSync

Fartech TimeSync is a full-stack employee time tracking system designed to help organizations manage employee work hours, attendance, and analytics efficiently.

The system provides role-based dashboards for administrators (Admin), managers (Team Leader), and employees (Team members).

## Project Overview

This project was developed as part of a Software Engineering academic project at IU International University of Applied Science, Germany (IUBH).

The goal of the system is to provide a digital platform for managing employee time entries, monitoring productivity, and generating analytical insights for management.

The system includes:

- Secure authentication
- Role-based dashboards
- Time tracking
- Analytics visualization
- REST API backend
- Dockerized deployment

## System Architecture

The application follows a modern full-stack architecture:

Frontend
- React
- TailwindCSS
- Vite

Backend
- Node.js
- Express.js
- REST API

Database / Authentication
- Firebase Authentication
- Firestore

Testing
- Vitest
- React Testing Library
- Cypress

Containerization
- Docker
- Docker Compose

## Architecture Diagram

Client (React Frontend)
        |
        v
Backend API (Express.js)
        |
        v
Firebase Authentication & Database

## Technical Architecture & Communication
This project follows a decoupled client-server architecture, where the React frontend and Express backend communicate via a RESTful API.
1. The API Layer (The Bridge)
Frontend Service Layer: Located in web-app/src/services/api.js, this uses Axios (or Fetch) to centralize all outgoing requests. It handles base URLs, headers, and error catching.
Backend Routing: Located in backend/routes/, each module (Users, Payments, Payroll) has its own dedicated router to keep endpoints organized and maintainable.
2. Authentication Flow
Firebase Integration: You use a hybrid approach. The firebase.js files in both the frontend and backend suggest that Firebase handles initial user identity, which is then verified by your backend/middleware/auth.js.
Context API: In the frontend, the AuthContext.jsx acts as a "source of truth," storing the user's session and sharing it with every page (Dashboard, Admin, etc.) so the user doesn't have to log in repeatedly.
3. Data Processing Flow
Request: A user performs an action (e.g., logging time in TimeEntry.jsx).
Service: The services/ layer sends an authenticated request to the backend.
Middleware: The backend/middleware/ checks if the user is logged in and has an active subscription.
Controller: The controllers/timeEntryController.js processes the business logic.
Model: Data is saved to the database via the models/TimeEntry.js schema.
Response: The backend sends a JSON response, and the frontend UI updates instantly.
4. Containerization & DevOps
Docker: Each part of your app is containerized. The Dockerfile in each directory ensures that the environment is identical whether you are developing on your laptop or deploying to a cloud server.
Docker Compose: The root-level orchestration allows you to spin up the Database, Backend, and Frontend simultaneously with a single command: docker-compose up.

## Key Technologies
Build Tool: Vite (High-speed frontend development)
Styling: Tailwind CSS (Implied by index.css)
Payments: Stripe (Secure billing and subscriptions)
Cloud Ops: AWS (Storage and Infrastructure)
Package Manager: pnpm (Efficient, disk-space-saving dependency management)


## Project Structure


fartech-timesync/
├── backend/                        # Node.js / Express Backend
│   ├── config/                     # Configuration for 3rd party services
│   │   ├── aws.js                  # AWS SDK setup
│   │   ├── database.js             # DB Connection (MongoDB/SQL)
│   │   ├── firebase.js             # Firebase Admin SDK
│   │   └── stripe.js               # Payment Gateway config
│   ├── controllers/                # Logic for processing requests
│   │   ├── authController.js       # Login/Registration logic
│   │   ├── paymentController.js    # Stripe integration logic
│   │   ├── payrollController.js    # Salary/Payroll processing
│   │   ├── teamController.js       # Team/Member management
│   │   └── timeEntryController.js  # Time tracking logic
│   ├── middleware/                 # Request interceptors
│   │   ├── auth.js                 # JWT/Token verification
│   │   ├── checkSubscription.js    # Access control based on billing
│   │   ├── roleMiddleware.js       # Admin vs. User permissions
│   │   └── validation.js           # Input data sanitization
│   ├── models/                     # Database Schemas
│   │   ├── Payment.js
│   │   ├── Payroll.js
│   │   ├── Team.js
│   │   ├── TimeEntry.js
│   │   └── User.js
│   ├── routes/                     # API Endpoint Definitions
│   │   ├── auth.js
│   │   ├── payments.js
│   │   ├── payrollRoutes.js
│   │   ├── teams.js
│   │   ├── timeEntries.js
│   │   └── users.js
│   ├── tests/                      # Backend Test Suite
│   │   ├── auth.test.js
│   │   ├── health.test.js
│   │   ├── server.test.js
│   │   └── timeEntry.test.js
│   ├── .dockerignore               # Files excluded from Docker
│   ├── .env                        # Environment variables (Secrets)
│   ├── docker-compose.yml          # Backend container orchestration
│   ├── Dockerfile                  # Backend build instructions
│   ├── package.json                # Dependencies & Scripts
│   ├── pnpm-lock.yaml              # PNPM Lockfile
│   └── server.js                   # Application Entry Point
│
└── web-app/                        # React (Vite) Frontend
    ├── cypress/                    # E2E Testing with Cypress
    │   ├── e2e/                    # Test specifications
    │   ├── fixtures/               # Mock data for tests
    │   └── support/                # Custom Cypress commands
    ├── public/                     # Static Assets (Images, Icons)
    ├── src/                        # Main Frontend Source
    │   ├── assets/                 # SVGs and Global Styles
    │   ├── components/             # Reusable UI Components
    │   │   ├── common/             # Charts, Navbars, Buttons
    │   │   └── layout/             # MainLayout wrappers
    │   ├── contexts/               # Global State Management
    │   │   ├── AuthContext.jsx     # User Auth State
    │   │   └── useAuth.jsx         # Custom Auth Hook
    │   ├── pages/                  # Page Views (Routes)
    │   │   ├── AdminAnalytics.jsx  # Data Dashboards
    │   │   ├── AdminPayroll.jsx    # Payroll Admin View
    │   │   ├── Approvals.jsx       # Request management
    │   │   ├── Dashboard.jsx       # User Homepage
    │   │   ├── Login.jsx           # Sign-in page
    │   │   ├── Register.jsx        # Sign-up page
    │   │   ├── Subscription.jsx    # Billing/Plans
    │   │   ├── TimeEntry.jsx       # Logging work hours
    │   │   └── UploadProof.jsx     # Document uploads
    │   ├── services/               # API & Integration logic
    │   │   ├── api.js              # Axios/Base API config
    │   │   ├── auth.js             # Auth service methods
    │   │   └── firebase.js         # Firebase client setup
    │   ├── tests/                  # Unit/Component Tests
    │   │   ├── app.test.jsx
    │   │   ├── dashboard.test.jsx
    │   │   └── login.test.jsx
    │   ├── App.css                 # Main app styles
    │   ├── App.jsx                 # Root component & Routing
    │   ├── index.css               # Global tailwind/css
    │   ├── main.jsx                # React DOM entry
    │   └── setupTests.js           # Testing environment config
    ├── .dockerignore               # Files excluded from Docker
    ├── .env.local                  # Frontend environment keys
    ├── .gitignore                  # Files ignored by Git
    ├── cypress.config.js           # Cypress configuration
    ├── Dockerfile                  # Frontend build instructions
    ├── docker-compose.yml          # Frontend container orchestration
    ├── eslint.config.js            # Linting rules
    ├── index.html                  # HTML template
    ├── package.json                # Project dependencies
    ├── pnpm-lock.yaml              # PNPM Lockfile
    ├── README.md                   # Frontend-specific docs
    └── vite.config.js              # Vite build configuration




## Installation

Clone the repository

git clone https://github.com/1Faarris/fartech-timesync.git

cd fartech-timesync


Install dependencies 
npm install

## Running the Application 

** Run Backend 
cd backend
npm run dev

** Run Frontend
cd web-app
npm run dev

## Running Tests

Frontend Tests

npm test

Tools used:
- Vitest
- React Testing Library

End-to-End Tests

npx cypress open

Tool used:
- Cypress

## Docker Deployment

The application can be deployed using Docker.

Build and run containers

docker-compose up --build

This will start:

- frontend container
- backend container


## Features

User Authentication
- Secure login and registration using Firebase

Role Based Access
- Admin dashboard
- Manager(Team-Leader) dashboard
- Employee(Team-Member) dashboard

Time Tracking
- Employees can log work hours

Analytics
- Admin dashboard shows charts and insights

## Testing Strategy

The project includes multiple testing levels.

Unit Testing
- Component tests using Vitest

Integration Testing
- React Testing Library for component interaction

End-to-End Testing
- Cypress for real user workflows

This ensures system reliability and correctness.

## Future Improvements

- Mobile application
- Advanced reporting system
- Payroll integration
- Notification system

