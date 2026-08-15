const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const seedData = require('./seeders/seedRunner');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// CORS & Body Parser Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BookMart REST API Server Operational' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/authors', require('./routes/authorRoutes'));
app.use('/api/publishers', require('./routes/publisherRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and run auto-seeder if empty
connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`BookMart Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
