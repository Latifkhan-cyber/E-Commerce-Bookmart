const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Coupon = require('../models/Coupon');

dotenv.config();

const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('Database connection could not be established for seeding.');
      process.exit(1);
    }

    console.log('Clearing old database records...');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Author.deleteMany({});
    await Publisher.deleteMany({});
    await Coupon.deleteMany({});

    console.log('Cleared old database records.');

    // 1. Seed Admin & Customer Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bookmart.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'ADMIN',
      phone: '+92 300 1234567',
      addresses: [{
        fullName: 'BookMart HQ Admin',
        phone: '+92 300 1234567',
        street: '100 Tech Avenue, Block 5',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan',
        isDefault: true,
      }],
    });

    const demoCustomer = await User.create({
      name: 'John Doe',
      email: 'customer@gmail.com',
      password: 'customer123456',
      role: 'CUSTOMER',
      phone: '+92 321 9876543',
      addresses: [{
        fullName: 'John Doe',
        phone: '+92 321 9876543',
        street: '45 Bookworms Lane',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        country: 'Pakistan',
        isDefault: true,
      }],
    });

    console.log(`Seeded Admin User: ${adminUser.email} (Password: admin123456)`);
    console.log(`Seeded Customer User: ${demoCustomer.email} (Password: customer123456)`);

    // 2. Seed Categories
    const categoriesData = [
      { name: 'Programming', description: 'Master web development, algorithms, software design, and architecture.', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80' },
      { name: 'Fiction & Novels', description: 'Immerse yourself in world-class fiction, thrillers, and literary classics.', image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80' },
      { name: 'Business & Finance', description: 'Learn management, investing, startup growth, and leadership skills.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80' },
      { name: 'Medical & Healthcare', description: 'Essential textbooks and clinical guides for doctors and medical students.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80' },
      { name: 'Mathematics & Logic', description: 'Explore linear algebra, calculus, discrete math, and statistics.', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80' },
      { name: 'Science & Physics', description: 'Astrophysics, quantum mechanics, biology, and chemistry essentials.', image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&q=80' },
      { name: 'History & Culture', description: 'Journey through ancient civilizations, world wars, and human history.', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&q=80' },
      { name: 'Islamic Books', description: 'Quranic studies, Hadith, Islamic jurisprudence, and spiritual growth.', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80' },
    ];

    const categories = await Promise.all(
      categoriesData.map(c => Category.create({ ...c, slug: slugify(c.name) }))
    );

    // 3. Seed Authors
    const authorsData = [
      { name: 'Robert C. Martin', bio: 'Renowned software engineer, author of Clean Code and Clean Architecture.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80' },
      { name: 'George Orwell', bio: 'Iconic English novelist, essayist, journalist, and author of 1984.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80' },
      { name: 'James Clear', bio: 'Author of Atomic Habits, specialized in habits, decision-making, and continuous improvement.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80' },
      { name: 'Benjamin Graham', bio: 'Father of value investing and mentor to Warren Buffett.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80' },
      { name: 'Yuval Noah Harari', bio: 'Historian, philosopher, and bestselling author of Sapiens.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&q=80' },
      { name: 'Dr. Arthur Guyton', bio: 'Author of the world-famous Textbook of Medical Physiology.', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&q=80' },
      { name: 'Thomas H. Cormen', bio: 'Co-author of Introduction to Algorithms (CLRS).', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&q=80' },
    ];

    const authors = await Promise.all(
      authorsData.map(a => Author.create({ ...a, slug: slugify(a.name) }))
    );

    // 4. Seed Publishers
    const publishersData = [
      { name: 'Prentice Hall', description: 'Leading educational publisher for computing and engineering.', logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
      { name: 'MIT Press', description: 'Affiliated with the Massachusetts Institute of Technology, publishing science and tech.', logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80' },
      { name: 'Penguin Random House', description: 'Largest trade book publisher in the world.', logo: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80' },
      { name: 'O\'Reilly Media', description: 'Renowned publisher of technical books, courses, and tech conferences.', logo: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80' },
      { name: 'Elsevier Medical', description: 'Global leader in medical information and healthcare publishing.', logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80' },
    ];

    const publishers = await Promise.all(
      publishersData.map(p => Publisher.create({ ...p, slug: slugify(p.name) }))
    );

    const getCat = name => categories.find(c => c.name.includes(name))._id;
    const getAut = name => authors.find(a => a.name.includes(name))._id;
    const getPub = name => publishers.find(p => p.name.includes(name))._id;

    // 5. Seed 20+ Books
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn\'t have to be that way.',
        author: getAut('Robert C. Martin'),
        publisher: getPub('Prentice Hall'),
        category: getCat('Programming'),
        isbn: '9780132350884',
        price: 2499,
        discountPrice: 1999,
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
        pages: 464,
        language: 'English',
        publicationYear: 2008,
        stock: 25,
        rating: 4.8,
        reviewCount: 42,
        featured: true,
        bestSeller: true,
      },
      {
        title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
        description: 'Practical software architecture solutions from the legendary Robert C. Martin. Learn the core principles of software structure and modularity.',
        author: getAut('Robert C. Martin'),
        publisher: getPub('Prentice Hall'),
        category: getCat('Programming'),
        isbn: '9780134494166',
        price: 2899,
        discountPrice: 2299,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
        pages: 432,
        language: 'English',
        publicationYear: 2017,
        stock: 18,
        rating: 4.7,
        reviewCount: 31,
        featured: true,
        bestSeller: false,
      },
      {
        title: 'Introduction to Algorithms (4th Edition)',
        description: 'Comprehensive guide to algorithms covering sorting, graph algorithms, dynamic programming, and complexity theory.',
        author: getAut('Thomas H. Cormen'),
        publisher: getPub('MIT Press'),
        category: getCat('Programming'),
        isbn: '9780262046305',
        price: 4999,
        discountPrice: 4299,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
        pages: 1312,
        language: 'English',
        publicationYear: 2022,
        stock: 12,
        rating: 4.9,
        reviewCount: 58,
        featured: true,
        bestSeller: true,
      },
      {
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        description: 'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear reveals practical strategies to form good habits.',
        author: getAut('James Clear'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Business'),
        isbn: '9780735211292',
        price: 1899,
        discountPrice: 1499,
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
        pages: 320,
        language: 'English',
        publicationYear: 2018,
        stock: 40,
        rating: 4.9,
        reviewCount: 120,
        featured: true,
        bestSeller: true,
      },
      {
        title: '1984 - Modern Classics Edition',
        description: 'Winston Smith rewrites history for the Ministry of Truth in Orwell\'s chilling dystopian masterpiece warning against totalitarian censorship.',
        author: getAut('George Orwell'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Fiction'),
        isbn: '9780451524935',
        price: 1299,
        discountPrice: 999,
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80',
        pages: 328,
        language: 'English',
        publicationYear: 1949,
        stock: 30,
        rating: 4.8,
        reviewCount: 95,
        featured: false,
        bestSeller: true,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        description: 'Explore 70,000 years of human history, from early hominids to the cognitive and industrial revolutions that shaped modern civilization.',
        author: getAut('Yuval Noah Harari'),
        publisher: getPub('Penguin Random House'),
        category: getCat('History'),
        isbn: '9780062316097',
        price: 2199,
        discountPrice: 1799,
        coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80',
        pages: 443,
        language: 'English',
        publicationYear: 2014,
        stock: 22,
        rating: 4.8,
        reviewCount: 88,
        featured: true,
        bestSeller: true,
      },
      {
        title: 'The Intelligent Investor (Revised Edition)',
        description: 'The definitive book on value investing. Benjamin Graham teaches emotional discipline and risk management for long-term financial freedom.',
        author: getAut('Benjamin Graham'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Business'),
        isbn: '9780060555665',
        price: 2599,
        discountPrice: 1999,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        pages: 640,
        language: 'English',
        publicationYear: 2003,
        stock: 15,
        rating: 4.7,
        reviewCount: 45,
        featured: false,
        bestSeller: true,
      },
      {
        title: 'Guyton and Hall Textbook of Medical Physiology',
        description: 'The world’s premier medical physiology textbook, presenting complex concepts in a clear, engaging, and easy-to-understand format.',
        author: getAut('Dr. Arthur Guyton'),
        publisher: getPub('Elsevier Medical'),
        category: getCat('Medical'),
        isbn: '9780323597128',
        price: 6599,
        discountPrice: 5999,
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
        pages: 1152,
        language: 'English',
        publicationYear: 2020,
        stock: 8,
        rating: 4.9,
        reviewCount: 24,
        featured: true,
        bestSeller: false,
      },
      {
        title: 'Designing Data-Intensive Applications',
        description: 'The definitive guide to system architecture, distributed databases, scalability, reliability, and data processing engines.',
        author: getAut('Robert C. Martin'),
        publisher: getPub('O\'Reilly Media'),
        category: getCat('Programming'),
        isbn: '9781449373320',
        price: 3499,
        discountPrice: 2999,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
        pages: 616,
        language: 'English',
        publicationYear: 2017,
        stock: 20,
        rating: 4.95,
        reviewCount: 77,
        featured: true,
        bestSeller: true,
      },
      {
        title: 'Animal Farm: A Fairy Story',
        description: 'A revolutionary political satire detailing the rebellion of farm animals against human tyranny.',
        author: getAut('George Orwell'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Fiction'),
        isbn: '9780451526342',
        price: 999,
        discountPrice: 799,
        coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&q=80',
        pages: 144,
        language: 'English',
        publicationYear: 1945,
        stock: 35,
        rating: 4.6,
        reviewCount: 50,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Linear Algebra and Its Applications',
        description: 'Fundamental textbook covering vector spaces, matrices, linear transformations, eigenvalues, and mathematical modeling.',
        author: getAut('Thomas H. Cormen'),
        publisher: getPub('Prentice Hall'),
        category: getCat('Mathematics'),
        isbn: '9780321982384',
        price: 3199,
        discountPrice: 0,
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80',
        pages: 576,
        language: 'English',
        publicationYear: 2015,
        stock: 14,
        rating: 4.5,
        reviewCount: 19,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Quantum Mechanics: The Theoretical Minimum',
        description: 'An engaging, accessible introduction to quantum physics and theoretical mechanics for science enthusiasts.',
        author: getAut('Yuval Noah Harari'),
        publisher: getPub('MIT Press'),
        category: getCat('Science'),
        isbn: '9780465062904',
        price: 2399,
        discountPrice: 1999,
        coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80',
        pages: 384,
        language: 'English',
        publicationYear: 2014,
        stock: 10,
        rating: 4.7,
        reviewCount: 22,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Seerah of Prophet Muhammad (PBUH)',
        description: 'Comprehensive study of the life, character, leadership, and teachings of Prophet Muhammad (PBUH).',
        author: getAut('Yuval Noah Harari'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Islamic Books'),
        isbn: '9789960899558',
        price: 1799,
        discountPrice: 1399,
        coverImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&q=80',
        pages: 560,
        language: 'English',
        publicationYear: 2019,
        stock: 50,
        rating: 5.0,
        reviewCount: 140,
        featured: true,
        bestSeller: true,
      },
      {
        title: 'The Clean Coder: A Code of Conduct for Professional Programmers',
        description: 'Practical advice on estimation, coding, refactoring, testing, and managing work-life expectations as a developer.',
        author: getAut('Robert C. Martin'),
        publisher: getPub('Prentice Hall'),
        category: getCat('Programming'),
        isbn: '9780137081073',
        price: 2299,
        discountPrice: 1899,
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',
        pages: 256,
        language: 'English',
        publicationYear: 2011,
        stock: 16,
        rating: 4.6,
        reviewCount: 28,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Calculus: Early Transcendentals',
        description: 'Rigorous mathematics text covering single-variable and multivariable calculus with real-world physics applications.',
        author: getAut('Thomas H. Cormen'),
        publisher: getPub('MIT Press'),
        category: getCat('Mathematics'),
        isbn: '9781285741550',
        price: 4499,
        discountPrice: 3899,
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80',
        pages: 1368,
        language: 'English',
        publicationYear: 2015,
        stock: 6,
        rating: 4.6,
        reviewCount: 14,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Robbins and Cotran Pathologic Basis of Disease',
        description: 'The gold standard pathology reference book for medical students and health science practitioners.',
        author: getAut('Dr. Arthur Guyton'),
        publisher: getPub('Elsevier Medical'),
        category: getCat('Medical'),
        isbn: '9780323531139',
        price: 7499,
        discountPrice: 6799,
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
        pages: 1408,
        language: 'English',
        publicationYear: 2020,
        stock: 4,
        rating: 4.9,
        reviewCount: 18,
        featured: false,
        bestSeller: true,
      },
      {
        title: 'Homo Deus: A Brief History of Tomorrow',
        description: 'Harari turns his focus to the future of humanity, artificial intelligence, biotechnology, and potential dystopian paths.',
        author: getAut('Yuval Noah Harari'),
        publisher: getPub('Penguin Random House'),
        category: getCat('History'),
        isbn: '9780062464316',
        price: 2299,
        discountPrice: 1799,
        coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80',
        pages: 464,
        language: 'English',
        publicationYear: 2017,
        stock: 19,
        rating: 4.7,
        reviewCount: 39,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'JavaScript: The Good Parts',
        description: 'Unearth the elegant programming language hidden inside JavaScript\'s quirky syntax and features.',
        author: getAut('Robert C. Martin'),
        publisher: getPub('O\'Reilly Media'),
        category: getCat('Programming'),
        isbn: '9780596517748',
        price: 1599,
        discountPrice: 1199,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
        pages: 172,
        language: 'English',
        publicationYear: 2008,
        stock: 22,
        rating: 4.5,
        reviewCount: 40,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'High-Output Management',
        description: 'Former Intel CEO Andrew Grove presents foundational principles of business leadership, team performance, and management efficiency.',
        author: getAut('Benjamin Graham'),
        publisher: getPub('Penguin Random House'),
        category: getCat('Business'),
        isbn: '9780679762881',
        price: 1999,
        discountPrice: 1599,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        pages: 256,
        language: 'English',
        publicationYear: 1995,
        stock: 14,
        rating: 4.8,
        reviewCount: 26,
        featured: false,
        bestSeller: false,
      },
      {
        title: 'Fundamentals of Database Systems (7th Edition)',
        description: 'Comprehensive coverage of SQL, relational algebra, database normalization, indexing, transaction processing, and NoSQL engines.',
        author: getAut('Thomas H. Cormen'),
        publisher: getPub('Prentice Hall'),
        category: getCat('Programming'),
        isbn: '9780133970777',
        price: 3899,
        discountPrice: 3299,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
        pages: 1272,
        language: 'English',
        publicationYear: 2016,
        stock: 11,
        rating: 4.6,
        reviewCount: 21,
        featured: false,
        bestSeller: false,
      },
    ];

    const createdBooks = await Promise.all(
      booksData.map(b => Book.create({ ...b, slug: slugify(b.title) + '-' + Date.now() }))
    );

    console.log(`Seeded ${createdBooks.length} books successfully.`);

    // 6. Seed Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscountAmount: 500,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
    });

    await Coupon.create({
      code: 'SALE20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 3000,
      maxDiscountAmount: 1000,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
    });

    await Coupon.create({
      code: 'BOOKMART500',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 2500,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
    });

    console.log('Seeded initial promo coupons (WELCOME10, SALE20, BOOKMART500).');
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error with database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
