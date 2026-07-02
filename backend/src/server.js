const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend assets in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Mount API routes
app.use('/api', apiRoutes);

// Catch-all route to serve index.html for React routing in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Startup database seeding function
async function seedDatabase() {
  try {
    // 1. Seed Admin User
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminUser = await db.users.findOne({ username: adminUsername });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
      await db.users.create({
        username: adminUsername,
        password: hashedPassword
      });
      console.log('Database Seeding: Admin user created successfully.');
    }

    // 2. Seed Default Categories
    const categories = await db.categories.find({});
    if (categories.length === 0) {
      const defaultCats = [
        { title: 'Silk Sarees', subcategories: ['Katan Silk', 'Tussar Silk', 'Organza Silk', 'Art Silk'], sortOrder: 1, isActive: true },
        { title: 'Banarasi Sarees', subcategories: ['Zari Banarasi', 'Georgette Banarasi', 'Kora Banarasi'], sortOrder: 2, isActive: true },
        { title: 'Kanjivaram Sarees', subcategories: ['Pure Zari Kanjivaram', 'Half Fine Kanjivaram'], sortOrder: 3, isActive: true },
        { title: 'Cotton Sarees', subcategories: ['Mulmul Cotton', 'Chanderi Cotton', 'Linen Cotton'], sortOrder: 4, isActive: true },
        { title: 'Chiffon Sarees', subcategories: ['Printed Chiffon', 'Pure Chiffon'], sortOrder: 5, isActive: true },
        { title: 'Georgette Sarees', subcategories: ['Embroidered Georgette', 'Faux Georgette'], sortOrder: 6, isActive: true },
        { title: 'Designer Sarees', subcategories: ['Ruffle Sarees', 'Ready to Wear', 'Sequins work'], sortOrder: 7, isActive: true },
        { title: 'Bridal Sarees', subcategories: ['Heavy Border Bridal', 'Velvet Border', 'Zardozi'], sortOrder: 8, isActive: true },
        { title: 'Printed Sarees', subcategories: ['Block Print', 'Bandhani Print', 'Ajrakh Print'], sortOrder: 9, isActive: true },
        { title: 'Party Wear Sarees', subcategories: ['Satin Party Wear', 'Net Party Wear'], sortOrder: 10, isActive: true },
        { title: 'Daily Wear Sarees', subcategories: ['Georgette Daily', 'Cotton Daily'], sortOrder: 11, isActive: true }
      ];
      
      for (const cat of defaultCats) {
        await db.categories.create(cat);
      }
      console.log('Database Seeding: Default categories seeded.');
    }

    // 3. Seed Default Collections
    const collections = await db.collections.find({});
    if (collections.length === 0) {
      const defaultColls = [
        { title: 'Wedding Collection', description: 'Royal heavy-weaved sarees crafted specifically for grand Indian weddings.', bannerImage: '', sarees: [], showOnHome: true, isActive: true },
        { title: 'Festival Collection', description: 'Celebrate joy and vibrancy with our rich shades and comfortable drapes.', bannerImage: '', sarees: [], showOnHome: true, isActive: true },
        { title: 'Bridal Collection', description: 'Pure luxury bridal wear featuring exquisite gold borders and handwork.', bannerImage: '', sarees: [], showOnHome: true, isActive: true },
        { title: 'Traditional Collection', description: 'Preserving heritage styles and handlooms handed down through generations.', bannerImage: '', sarees: [], showOnHome: true, isActive: true },
        { title: 'Office Wear Collection', description: 'Sophisticated and crisp cottons/linens to elevate your workday style.', bannerImage: '', sarees: [], showOnHome: false, isActive: true },
        { title: 'Party Wear Collection', description: 'Contemporary designs and shimmering georgettes for absolute spotlight.', bannerImage: '', sarees: [], showOnHome: false, isActive: true }
      ];

      for (const coll of defaultColls) {
        await db.collections.create(coll);
      }
      console.log('Database Seeding: Default collections seeded.');
    }

    // 4. Seed Default Announcements
    const announcements = await db.announcements.find({});
    if (announcements.length === 0) {
      await db.announcements.create({ content: '✨ New Festive Saree Collection Live Now - Browse and Inquiry Directly on WhatsApp ✨', order: 1, isActive: true });
      await db.announcements.create({ content: '📦 Special Discount on Selected Silk and Banarasi Sarees - Limited Time Offer 📦', order: 2, isActive: true });
      console.log('Database Seeding: Default announcements seeded.');
    }

    // 5. Initialize Shop Settings
    const settings = await db.settings.findOne({});
    if (!settings) {
      await db.settings.create({
        shopName: 'Bani Thani Textiles',
        logoUrl: '',
        contactDetails: {
          address: 'Bani Thani Textiles, Ethnic Market, Johari Bazaar, Jaipur, Rajasthan, India',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          email: 'info@banithanitextiles.com'
        },
        socialLinks: {
          facebook: 'https://facebook.com/banithanitextiles',
          instagram: 'https://instagram.com/banithanitextiles',
          pinterest: 'https://pinterest.com/banithanitextiles'
        },
        aboutPageContent: {
          title: 'Preserving Indian Heritage Since 1998',
          story: 'Bani Thani Textiles is born from a desire to celebrate the rich tradition of Indian handloom and textile arts. Inspired by the classic Rajasthani "Bani Thani" painting—known as the Indian Mona Lisa representing absolute poise, graceful features, and ornate jewelry—we source the finest sarees from craft hubs across India. Every thread represents weeks of dedicated loom-work by master artisans, bridging heritage craft with modern aesthetics.',
          features: [
            '100% Genuine Weaves: Direct associations with handloom clusters.',
            'Quality Assured: Rigorous standards on silks, zari content, and embellishments.',
            'Artisan Support: Supporting traditional weaver families across Rajasthan, Banaras, and Kanchipuram.'
          ]
        },
        contactPageContent: {
          title: 'Visit Our Jaipur Flagship Store',
          description: 'Experience the soft texture and vibrant hues of our sarees in person. Our design consultants are available for personalized styling or customized bridal trousseau assemblies.'
        }
      });
      console.log('Database Seeding: Default store settings initialized.');
    }

  } catch (error) {
    console.error('Database Seeding Error:', error);
  }
}

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await seedDatabase();
  });
} else {
  // In Vercel serverless context, seed on import
  seedDatabase();
}

module.exports = app;
