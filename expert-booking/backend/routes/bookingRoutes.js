const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
} = require('../controllers/bookingController');

const bookingValidation = [
  body('expertId').notEmpty().withMessage('Expert ID is required'),
  body('clientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('clientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('clientPhone')
    .matches(/^\+?[\d\s\-()]{7,15}$/)
    .withMessage('Valid phone number is required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('timeSlot')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time slot must be in HH:MM format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// POST /api/bookings
router.post('/', bookingValidation, createBooking);

// GET /api/bookings?email=
router.get('/', getBookingsByEmail);

// PATCH /api/bookings/:id/status
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
