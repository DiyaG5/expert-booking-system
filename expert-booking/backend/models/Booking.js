const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    expertName: { type: String, required: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    clientPhone: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number'],
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:MM
    notes: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent double booking
bookingSchema.index({ expert: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
