require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking';

function generateSlots() {
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split('T')[0];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    times.forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false });
    });
  }
  return slots;
}

const experts = [
  {
    name: 'Dr. Priya Sharma',
    category: 'Health',
    bio: 'Board-certified physician with 15+ years in preventive medicine and holistic health. Specializes in lifestyle medicine and chronic disease management.',
    experience: 15,
    rating: 4.9,
    reviewCount: 312,
    hourlyRate: 3500,
    expertise: ['Preventive Medicine', 'Nutrition', 'Chronic Disease', 'Mental Wellness'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Arjun Mehta',
    category: 'Technology',
    bio: 'Senior software architect at a Fortune 500 company. Expert in cloud architecture, microservices, and AI/ML system design with 12 years of experience.',
    experience: 12,
    rating: 4.8,
    reviewCount: 245,
    hourlyRate: 4000,
    expertise: ['Cloud Architecture', 'Microservices', 'AI/ML', 'System Design'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Kavita Reddy',
    category: 'Finance',
    bio: 'Certified Financial Planner (CFP) with expertise in wealth management, tax planning, and investment strategy for individuals and businesses.',
    experience: 10,
    rating: 4.7,
    reviewCount: 189,
    hourlyRate: 3000,
    expertise: ['Wealth Management', 'Tax Planning', 'Investment Strategy', 'Retirement Planning'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Rohit Kapoor',
    category: 'Legal',
    bio: 'Corporate lawyer with expertise in startup law, intellectual property, mergers & acquisitions, and contract negotiation across multiple jurisdictions.',
    experience: 14,
    rating: 4.8,
    reviewCount: 278,
    hourlyRate: 5000,
    expertise: ['Startup Law', 'IP Rights', 'M&A', 'Contract Law'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Sneha Patel',
    category: 'Marketing',
    bio: 'Digital marketing strategist who has led growth campaigns for 50+ brands. Expert in performance marketing, SEO, and brand building.',
    experience: 8,
    rating: 4.6,
    reviewCount: 156,
    hourlyRate: 2500,
    expertise: ['Performance Marketing', 'SEO/SEM', 'Brand Strategy', 'Social Media'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Prof. Anand Kumar',
    category: 'Education',
    bio: 'Former IIT professor with 20 years in academia. Specializes in career guidance, exam preparation strategy, and academic mentorship.',
    experience: 20,
    rating: 4.9,
    reviewCount: 423,
    hourlyRate: 2000,
    expertise: ['Career Guidance', 'JEE/UPSC Strategy', 'Academic Mentorship', 'Research Writing'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Meera Joshi',
    category: 'Design',
    bio: 'Lead UX/UI designer with experience at top product companies. Creates user-centered designs that drive engagement and business results.',
    experience: 7,
    rating: 4.7,
    reviewCount: 134,
    hourlyRate: 3200,
    expertise: ['UX Research', 'UI Design', 'Design Systems', 'Figma'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Vikram Singh',
    category: 'Business',
    bio: 'Serial entrepreneur and startup mentor. Has founded 3 companies and mentored 100+ startups through various accelerators. Expert in go-to-market strategy.',
    experience: 18,
    rating: 4.8,
    reviewCount: 367,
    hourlyRate: 6000,
    expertise: ['Startup Strategy', 'Go-to-Market', 'Fundraising', 'Business Development'],
    availableSlots: generateSlots(),
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    await Expert.deleteMany({});
    console.log('🗑️  Cleared existing experts');

    const inserted = await Expert.insertMany(experts);
    console.log(`✅ Seeded ${inserted.length} experts`);

    await mongoose.disconnect();
    console.log('✅ Done! Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
