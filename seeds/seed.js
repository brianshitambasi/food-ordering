const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Food = require('../models/Food');
const User = require('../models/User');

dotenv.config();

const foods = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
    price: 12.99,
    category: 'Pizza',
    image: 'https://example.com/margherita.jpg',
    isAvailable: true,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Pizza with pepperoni, mozzarella, and tomato sauce.',
    price: 15.99,
    category: 'Pizza',
    image: 'https://example.com/pepperoni.jpg',
    isAvailable: true,
  },
  {
    name: 'Veggie Burger',
    description: 'Grilled veggie patty with lettuce, tomato, and onion.',
    price: 10.49,
    category: 'Burger',
    image: 'https://example.com/veggieburger.jpg',
    isAvailable: true,
  },
  {
    name: 'Chicken Burger',
    description: 'Crispy chicken fillet with cheese and mayo.',
    price: 11.99,
    category: 'Burger',
    image: 'https://example.com/chickenburger.jpg',
    isAvailable: true,
  },
  {
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons, and caesar dressing.',
    price: 8.99,
    category: 'Salad',
    image: 'https://example.com/caesar.jpg',
    isAvailable: true,
  },
  {
    name: 'Pasta Carbonara',
    description: 'Pasta with creamy sauce, bacon, and parmesan.',
    price: 13.49,
    category: 'Pasta',
    image: 'https://example.com/carbonara.jpg',
    isAvailable: true,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Food.deleteMany({});
    await User.deleteMany({});
    console.log('Data cleared');

    // Insert foods
    await Food.insertMany(foods);
    console.log('Foods inserted');

    // Hash passwords manually
    const salt = await bcrypt.genSalt(10);
    
    // Create admin user with hashed password
    const adminPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('Admin user created: admin@example.com / admin123');

    // Create test user with hashed password
    const testPassword = await bcrypt.hash('test123', salt);
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: testPassword,
      role: 'user',
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA',
      },
    });
    console.log('Test user created: test@example.com / test123');

    console.log('Database seeded successfully!');
    console.log('\n========================================');
    console.log('Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: test@example.com / test123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
