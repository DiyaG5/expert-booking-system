const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:MM
  isBooked: { type: Boolean, default: false },
});

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Education', 'Design', 'Business'],
    },
    bio: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 }, // years
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    avatar: { type: String, default: '' },
    expertise: [{ type: String }],
    availableSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

expertSchema.index({ name: 'text', bio: 'text' });
expertSchema.index({ category: 1 });

module.exports = mongoose.model('Expert', expertSchema);
