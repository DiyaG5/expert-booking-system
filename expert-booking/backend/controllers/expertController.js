const Expert = require('../models/Expert');

// GET /api/experts
exports.getExperts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      category,
      search,
      sort = '-rating',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { bio: { $regex: search.trim(), $options: 'i' } },
        { expertise: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [experts, total] = await Promise.all([
      Expert.find(filter)
        .select('-availableSlots')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/experts/:id
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).lean();

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Group available slots by date
    const slotsByDate = {};
    if (expert.availableSlots) {
      expert.availableSlots.forEach((slot) => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push({
          _id: slot._id,
          time: slot.time,
          isBooked: slot.isBooked,
        });
      });
    }

    // Sort dates
    const sortedSlotsByDate = Object.keys(slotsByDate)
      .sort()
      .reduce((acc, date) => {
        acc[date] = slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
        return acc;
      }, {});

    res.json({
      success: true,
      data: { ...expert, slotsByDate: sortedSlotsByDate },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid expert ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
