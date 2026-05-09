const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { validationResult } = require('express-validator');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { expertId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;
  const io = req.app.get('io');

  // Use a MongoDB session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Lock-and-check: find expert and verify slot availability atomically
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'availableSlots.date': date,
        'availableSlots.time': timeSlot,
        'availableSlots.isBooked': false,
      },
      {
        $set: { 'availableSlots.$[slot].isBooked': true },
      },
      {
        arrayFilters: [{ 'slot.date': date, 'slot.time': timeSlot, 'slot.isBooked': false }],
        new: true,
        session,
      }
    );

    if (!expert) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please choose another slot.',
      });
    }

    // Create booking
    const booking = new Booking({
      expert: expertId,
      expertName: expert.name,
      clientName,
      clientEmail,
      clientPhone,
      date,
      timeSlot,
      notes,
      status: 'pending',
    });

    await booking.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Emit real-time slot update to all clients viewing this expert
    if (io) {
      io.to(`expert-${expertId}`).emit('slot-booked', {
        expertId,
        date,
        timeSlot,
        isBooked: true,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: booking,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Handle unique index violation (double booking at DB level)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This slot was just booked by someone else. Please choose another slot.',
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings?email=
exports.getBookingsByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  try {
    const bookings = await Booking.find({ clientEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Status updated', data: booking });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
