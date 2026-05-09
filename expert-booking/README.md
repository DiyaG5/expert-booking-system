# ExpertConnect — Real-Time Expert Session Booking System

A full-stack app for booking expert sessions with real-time slot updates using Socket.io.

## Tech Stack
- **Frontend**: React (Web), Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Database**: MongoDB with Mongoose

## Project Structure

```
expert-booking/
├── backend/
│   ├── controllers/
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── models/
│   │   ├── Expert.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Navbar.css
    │   ├── context/
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── ExpertList.jsx / .css
    │   │   ├── ExpertDetail.jsx / .css
    │   │   ├── BookingPage.jsx / .css
    │   │   └── MyBookings.jsx / .css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx / App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/experts | List experts (pagination, search, filter) |
| GET | /api/experts/:id | Get expert with grouped slots |
| POST | /api/bookings | Create booking (race-condition safe) |
| GET | /api/bookings?email= | Get bookings by email |
| PATCH | /api/bookings/:id/status | Update booking status |

## Setup Instructions

### 1. MongoDB
You need a running MongoDB instance. Either:
- Install locally: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (free tier): https://www.mongodb.com/atlas

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run seed      # Populate with sample experts
npm run dev       # Start on port 5000
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env if backend runs on a different port
npm install
npm start         # Start on port 3000
```

## Key Features
- ✅ Real-time slot updates via Socket.io
- ✅ Race condition prevention via MongoDB transactions + compound unique index
- ✅ Full form validation (frontend + backend)
- ✅ Pagination, search, category filtering
- ✅ Booking status tracking (Pending/Confirmed/Completed)
- ✅ Responsive dark-themed UI
