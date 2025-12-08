require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const College = require('../models/College');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventra';

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Event.deleteMany({});
    // await College.deleteMany({});
    // console.log('Cleared existing data');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@eventra.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@eventra.com',
        password: 'Admin@123',
        role: 'admin',
        mobile: '9876543210',
        college: 'Eventra Admin'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@eventra.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create coordinator users
    const coordinators = [
      {
        name: 'Coordinator One',
        email: 'coordinator1@eventra.com',
        password: 'Coord@123',
        role: 'coordinator',
        mobile: '9876543211',
        college: 'Tech College'
      },
      {
        name: 'Coordinator Two',
        email: 'coordinator2@eventra.com',
        password: 'Coord@123',
        role: 'coordinator',
        mobile: '9876543212',
        college: 'Science College'
      }
    ];

    for (const coordData of coordinators) {
      const coordExists = await User.findOne({ email: coordData.email });
      if (!coordExists) {
        const coordinator = new User(coordData);
        await coordinator.save();
        console.log(`✅ Coordinator created: ${coordData.email} / coord123`);
      }
    }

    // Create sample student users
    const students = [
      {
        name: 'Student One',
        email: 'student1@eventra.com',
        password: 'Student@123',
        role: 'student',
        mobile: '9876543221',
        college: 'Tech College'
      },
      {
        name: 'Student Two',
        email: 'student2@eventra.com',
        password: 'Student@123',
        role: 'student',
        mobile: '9876543222',
        college: 'Science College'
      },
      {
        name: 'Student Three',
        email: 'student3@eventra.com',
        password: 'Student@123',
        role: 'student',
        mobile: '9876543223',
        college: 'Arts College'
      }
    ];

    for (const studentData of students) {
      const studentExists = await User.findOne({ email: studentData.email });
      if (!studentExists) {
        const student = new User(studentData);
        await student.save();
        console.log(`✅ Student created: ${studentData.email} / student123`);
      }
    }

    // Create main events (symposiums)
    const mainEvents = [
      {
        event_id: 'EVT2025_00001',
        title: 'Tech Symposium 2025',
        description: 'Annual technology symposium featuring cutting-edge innovations',
        about: 'A full-day flagship symposium covering engineering, tech talks, and workshops.',
        date: new Date('2025-06-15'),
        venue: 'Main Auditorium'
      },
      {
        event_id: 'EVT2025_00002',
        title: 'Science Fair 2025',
        description: 'Inter-college science exhibition and competition',
        about: 'Hands-on exhibits, competitions, and seminars across core science disciplines.',
        date: new Date('2025-07-20'),
        venue: 'Science Block'
      }
    ];

    for (const eventData of mainEvents) {
      const eventExists = await Event.findOne({ event_id: eventData.event_id });
      if (!eventExists) {
        const event = new Event(eventData);
        await event.save();
        console.log(`✅ Main event created: ${eventData.title}`);
      }
    }

    // Sub-events removed from data model; no seeding required.

    // Create sample colleges
    const colleges = [
      {
        college_id: 'COL001',
        name: 'Tech College',
        slug: 'tech-college',
        theme: '#3b82f6',
        logo: null
      },
      {
        college_id: 'COL002',
        name: 'Science College',
        slug: 'science-college',
        theme: '#10b981',
        logo: null
      },
      {
        college_id: 'COL003',
        name: 'Arts College',
        slug: 'arts-college',
        theme: '#8b5cf6',
        logo: null
      }
    ];

    for (const collegeData of colleges) {
      const collegeExists = await College.findOne({ college_id: collegeData.college_id });
      if (!collegeExists) {
        const college = new College(collegeData);
        await college.save();
        console.log(`✅ College created: ${collegeData.name}`);
      }
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@eventra.com / admin123');
    console.log('Coordinator: coordinator1@eventra.com / coord123');
    console.log('Student: student1@eventra.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();


