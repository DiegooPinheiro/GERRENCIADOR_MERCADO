# Steps to Run the Application Without Docker

## Prerequisites
- Install Node.js (if not already installed, download from https://nodejs.org/)

## Backend Setup
1. Activate the virtual environment: `mercado_backend\venv\Scripts\activate`
2. Run Django migrations: `python manage.py migrate` (now uses SQLite)
3. Start the Django server: `python manage.py runserver`

## Frontend Setup
1. Navigate to the frontend directory: `cd mercado_frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Access the Application
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173

## Notes
- The application now uses SQLite instead of PostgreSQL for easier setup
- The product registration form should now work properly
