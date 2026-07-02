const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/auth');
const customerAuth = require('../middleware/customerAuth');
const upload = require('../middleware/upload');

// Helper to calculate discount percentage
const calculateDiscount = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await db.users.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'banithanitextilessecretkeysupersecure123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { _id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Verify Token
router.get('/auth/verify', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Change Password
router.post('/auth/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await db.users.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.users.findByIdAndUpdate(req.user.id, { password: hashedPassword });
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// 1.1 CUSTOMER AUTHENTICATION ENDPOINTS
// ==========================================

// Register Customer
router.post('/customers/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingCustomer = await db.customers.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await db.customers.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: newCustomer._id, email: newCustomer.email, role: 'customer' },
      process.env.JWT_SECRET || 'banithanitextilessecretkeysupersecure123',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      customer: { _id: newCustomer._id, name: newCustomer.name, email: newCustomer.email, phone: newCustomer.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login Customer
router.post('/customers/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const customer = await db.customers.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email, role: 'customer' },
      process.env.JWT_SECRET || 'banithanitextilessecretkeysupersecure123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      customer: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get Current Customer Profile
router.get('/customers/me', customerAuth, async (req, res) => {
  try {
    const customer = await db.customers.findById(req.customer.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const { password, ...profile } = customer;
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Customer Inquiries
router.get('/customers/inquiries', customerAuth, async (req, res) => {
  try {
    const list = await db.inquiries.find({});
    const customerInquiries = list.filter(inq => 
      inq.customerDetails.email && inq.customerDetails.email.toLowerCase() === req.customer.email.toLowerCase()
    );
    customerInquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(customerInquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// ==========================================
// 2. SAREE CATALOG ENDPOINTS
// ==========================================

// Get Public Sarees (filtered and sorted)
router.get('/sarees', async (req, res) => {
  const {
    category,
    collection,
    minPrice,
    maxPrice,
    color,
    fabric,
    occasion,
    discount,
    isNewArrival,
    isBestSeller,
    isFeatured,
    isSale,
    stockStatus,
    search,
    sort
  } = req.query;

  try {
    // Only get visible sarees
    let list = await db.sarees.find({ isVisible: true });

    // Category Filter
    if (category) {
      list = list.filter(item => item.category === category);
    }

    // Collection Filter
    if (collection) {
      list = list.filter(item => item.collection === collection);
    }

    // Price Range Filter
    if (minPrice) {
      list = list.filter(item => {
        const activePrice = item.discountPrice ? Number(item.discountPrice) : Number(item.price);
        return activePrice >= Number(minPrice);
      });
    }
    if (maxPrice) {
      list = list.filter(item => {
        const activePrice = item.discountPrice ? Number(item.discountPrice) : Number(item.price);
        return activePrice <= Number(maxPrice);
      });
    }

    // Color Filter (case-insensitive substring/match)
    if (color) {
      list = list.filter(item => item.color && item.color.toLowerCase() === color.toLowerCase());
    }

    // Fabric Filter
    if (fabric) {
      list = list.filter(item => item.fabric && item.fabric.toLowerCase() === fabric.toLowerCase());
    }

    // Occasion Filter
    if (occasion) {
      list = list.filter(item => item.occasion && item.occasion.toLowerCase() === occasion.toLowerCase());
    }

    // Discount Filter
    if (discount === 'true') {
      list = list.filter(item => item.discountPrice && Number(item.discountPrice) < Number(item.price));
    }

    // Badges Filters
    if (isNewArrival === 'true') list = list.filter(item => item.isNewArrival === true || item.isNewArrival === 'true');
    if (isBestSeller === 'true') list = list.filter(item => item.isBestSeller === true || item.isBestSeller === 'true');
    if (isFeatured === 'true') list = list.filter(item => item.isFeatured === true || item.isFeatured === 'true');
    if (isSale === 'true') list = list.filter(item => item.isSale === true || item.isSale === 'true');

    // Stock Status
    if (stockStatus) {
      list = list.filter(item => item.stockStatus === stockStatus);
    }

    // Search Query (covers Name, SKU, Category, Collection, Fabric, Color, Occasion)
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.fabric && item.fabric.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q)) ||
        (item.occasion && item.occasion.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.collection && item.collection.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      list.sort((a, b) => (Number(a.discountPrice) || Number(a.price)) - (Number(b.discountPrice) || Number(b.price)));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => (Number(b.discountPrice) || Number(b.price)) - (Number(a.discountPrice) || Number(a.price)));
    } else if (sort === 'discount') {
      list.sort((a, b) => {
        const pctA = calculateDiscount(Number(a.price), Number(a.discountPrice));
        const pctB = calculateDiscount(Number(b.price), Number(b.discountPrice));
        return pctB - pctA;
      });
    } else if (sort === 'popular') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      // Default: Latest created
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sarees', error: error.message });
  }
});

// Get Saree by ID
router.get('/sarees/:id', async (req, res) => {
  try {
    const saree = await db.sarees.findById(req.params.id);
    if (!saree) {
      return res.status(404).json({ message: 'Saree not found' });
    }
    res.json(saree);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving saree', error: error.message });
  }
});

// Admin: Get All Sarees (including hidden)
router.get('/admin/sarees', auth, async (req, res) => {
  try {
    const list = await db.sarees.find({});
    // Sort latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sarees', error: error.message });
  }
});

// Admin: Add Saree (supports files upload)
router.post('/admin/sarees', auth, upload.array('images', 5), async (req, res) => {
  try {
    const rawData = req.body;
    
    // Convert uploaded files to base64 Data URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    }

    const price = Number(rawData.price);
    const discountPrice = rawData.discountPrice ? Number(rawData.discountPrice) : null;
    const discountPercentage = discountPrice ? calculateDiscount(price, discountPrice) : 0;

    const sareeData = {
      name: rawData.name,
      sku: rawData.sku || `BTT-${Math.floor(1000 + Math.random() * 9000)}`,
      price,
      discountPrice,
      discountPercentage,
      category: rawData.category,
      subcategory: rawData.subcategory || '',
      collection: rawData.collection || '',
      description: rawData.description || '',
      fabric: rawData.fabric || '',
      color: rawData.color || '',
      length: rawData.length || '5.5 Meters',
      blousePiece: rawData.blousePiece === 'true' || rawData.blousePiece === true,
      workType: rawData.workType || '',
      occasion: rawData.occasion || '',
      washCare: rawData.washCare || 'Dry Clean Only',
      isNewArrival: rawData.isNewArrival === 'true' || rawData.isNewArrival === true,
      isBestSeller: rawData.isBestSeller === 'true' || rawData.isBestSeller === true,
      isFeatured: rawData.isFeatured === 'true' || rawData.isFeatured === true,
      isSale: rawData.isSale === 'true' || rawData.isSale === true,
      stockStatus: rawData.stockStatus || 'in_stock',
      stockQty: Number(rawData.stockQty || 1),
      isVisible: rawData.isVisible === 'true' || rawData.isVisible === true || rawData.isVisible === undefined,
      images
    };

    const newSaree = await db.sarees.create(sareeData);
    res.status(201).json(newSaree);
  } catch (error) {
    res.status(500).json({ message: 'Error adding saree', error: error.message });
  }
});

// Admin: Edit Saree
router.put('/admin/sarees/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const rawData = req.body;
    const id = req.params.id;

    const existingSaree = await db.sarees.findById(id);
    if (!existingSaree) {
      return res.status(404).json({ message: 'Saree not found' });
    }

    // Process images: merge existing and new uploads
    let images = [];
    if (rawData.existingImages) {
      images = Array.isArray(rawData.existingImages) 
        ? rawData.existingImages 
        : [rawData.existingImages];
    }
    
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
      images = [...images, ...newImages];
    }

    // If no images at all, keep previous ones
    if (images.length === 0) {
      images = existingSaree.images || [];
    }

    const price = Number(rawData.price);
    const discountPrice = rawData.discountPrice ? Number(rawData.discountPrice) : null;
    const discountPercentage = discountPrice ? calculateDiscount(price, discountPrice) : 0;

    const updateData = {
      name: rawData.name,
      sku: rawData.sku,
      price,
      discountPrice,
      discountPercentage,
      category: rawData.category,
      subcategory: rawData.subcategory || '',
      collection: rawData.collection || '',
      description: rawData.description || '',
      fabric: rawData.fabric || '',
      color: rawData.color || '',
      length: rawData.length || '5.5 Meters',
      blousePiece: rawData.blousePiece === 'true' || rawData.blousePiece === true,
      workType: rawData.workType || '',
      occasion: rawData.occasion || '',
      washCare: rawData.washCare || 'Dry Clean Only',
      isNewArrival: rawData.isNewArrival === 'true' || rawData.isNewArrival === true,
      isBestSeller: rawData.isBestSeller === 'true' || rawData.isBestSeller === true,
      isFeatured: rawData.isFeatured === 'true' || rawData.isFeatured === true,
      isSale: rawData.isSale === 'true' || rawData.isSale === true,
      stockStatus: rawData.stockStatus || 'in_stock',
      stockQty: Number(rawData.stockQty || 0),
      isVisible: rawData.isVisible === 'true' || rawData.isVisible === true,
      images
    };

    const updatedSaree = await db.sarees.findByIdAndUpdate(id, updateData);
    res.json(updatedSaree);
  } catch (error) {
    res.status(500).json({ message: 'Error editing saree', error: error.message });
  }
});

// Admin: Delete Saree
router.delete('/admin/sarees/:id', auth, async (req, res) => {
  try {
    const deleted = await db.sarees.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Saree not found' });
    }
    res.json({ message: 'Saree deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting saree', error: error.message });
  }
});


// ==========================================
// 3. CATEGORY ENDPOINTS
// ==========================================

// Get Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.categories.find({});
    // Sort by order
    categories.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Admin: Add Category
router.post('/categories', auth, async (req, res) => {
  try {
    const { title, subcategories, sortOrder, isActive } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Category title is required' });
    }

    const subList = subcategories 
      ? (Array.isArray(subcategories) ? subcategories : subcategories.split(',').map(s => s.trim()))
      : [];

    const newCat = await db.categories.create({
      title,
      subcategories: subList,
      sortOrder: Number(sortOrder || 0),
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true)
    });
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
});

// Admin: Edit Category
router.put('/categories/:id', auth, async (req, res) => {
  try {
    const { title, subcategories, sortOrder, isActive } = req.body;
    const subList = subcategories 
      ? (Array.isArray(subcategories) ? subcategories : subcategories.split(',').map(s => s.trim()))
      : [];

    const updated = await db.categories.findByIdAndUpdate(req.params.id, {
      title,
      subcategories: subList,
      sortOrder: Number(sortOrder || 0),
      isActive: isActive === 'true' || isActive === true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// Admin: Delete Category
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    const deleted = await db.categories.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});


// ==========================================
// 4. COLLECTION ENDPOINTS
// ==========================================

// Get Collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await db.collections.find({ isActive: true });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
});

// Admin: Get all collections (including inactive)
router.get('/admin/collections', auth, async (req, res) => {
  try {
    const collections = await db.collections.find({});
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
});

// Get Collection by ID
router.get('/collections/:id', async (req, res) => {
  try {
    const collection = await db.collections.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection', error: error.message });
  }
});

// Admin: Create Collection
router.post('/admin/collections', auth, upload.single('bannerImage'), async (req, res) => {
  try {
    const rawData = req.body;
    const bannerImage = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '';

    const sarees = rawData.sarees
      ? (Array.isArray(rawData.sarees) ? rawData.sarees : JSON.parse(rawData.sarees))
      : [];

    const newColl = await db.collections.create({
      title: rawData.title,
      description: rawData.description || '',
      bannerImage,
      sarees,
      showOnHome: rawData.showOnHome === 'true' || rawData.showOnHome === true,
      isActive: rawData.isActive === 'true' || rawData.isActive === true || rawData.isActive === undefined
    });
    res.status(201).json(newColl);
  } catch (error) {
    res.status(500).json({ message: 'Error creating collection', error: error.message });
  }
});

// Admin: Edit Collection
router.put('/admin/collections/:id', auth, upload.single('bannerImage'), async (req, res) => {
  try {
    const rawData = req.body;
    const id = req.params.id;

    const existingColl = await db.collections.findById(id);
    if (!existingColl) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    let bannerImage = existingColl.bannerImage;
    if (req.file) {
      bannerImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const sarees = rawData.sarees
      ? (Array.isArray(rawData.sarees) ? rawData.sarees : JSON.parse(rawData.sarees))
      : existingColl.sarees || [];

    const updated = await db.collections.findByIdAndUpdate(id, {
      title: rawData.title,
      description: rawData.description || '',
      bannerImage,
      sarees,
      showOnHome: rawData.showOnHome === 'true' || rawData.showOnHome === true,
      isActive: rawData.isActive === 'true' || rawData.isActive === true
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collection', error: error.message });
  }
});

// Admin: Delete Collection
router.delete('/admin/collections/:id', auth, async (req, res) => {
  try {
    const deleted = await db.collections.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collection', error: error.message });
  }
});


// ==========================================
// 5. BANNER ENDPOINTS
// ==========================================

// Get Active Banners
router.get('/banners', async (req, res) => {
  try {
    const list = await db.banners.find({ showBanner: true });
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// Admin: Get all banners
router.get('/admin/banners', auth, async (req, res) => {
  try {
    const list = await db.banners.find({});
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// Admin: Create Banner
router.post('/admin/banners', auth, upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
  try {
    const rawData = req.body;
    const desktopImage = req.files && req.files.desktopImage ? `data:${req.files.desktopImage[0].mimetype};base64,${req.files.desktopImage[0].buffer.toString('base64')}` : '';
    const mobileImage = req.files && req.files.mobileImage ? `data:${req.files.mobileImage[0].mimetype};base64,${req.files.mobileImage[0].buffer.toString('base64')}` : desktopImage;

    const newBanner = await db.banners.create({
      title: rawData.title || '',
      subtitle: rawData.subtitle || '',
      buttonText: rawData.buttonText || 'Shop Now',
      buttonLink: rawData.buttonLink || '/shop',
      desktopImage,
      mobileImage,
      showBanner: rawData.showBanner === 'true' || rawData.showBanner === true || rawData.showBanner === undefined,
      order: Number(rawData.order || 0)
    });
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

// Admin: Edit Banner
router.put('/admin/banners/:id', auth, upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
  try {
    const rawData = req.body;
    const id = req.params.id;

    const existingBanner = await db.banners.findById(id);
    if (!existingBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    let desktopImage = existingBanner.desktopImage;
    let mobileImage = existingBanner.mobileImage;

    if (req.files) {
      if (req.files.desktopImage) {
        desktopImage = `data:${req.files.desktopImage[0].mimetype};base64,${req.files.desktopImage[0].buffer.toString('base64')}`;
      }
      if (req.files.mobileImage) {
        mobileImage = `data:${req.files.mobileImage[0].mimetype};base64,${req.files.mobileImage[0].buffer.toString('base64')}`;
      }
    }

    const updated = await db.banners.findByIdAndUpdate(id, {
      title: rawData.title || '',
      subtitle: rawData.subtitle || '',
      buttonText: rawData.buttonText || 'Shop Now',
      buttonLink: rawData.buttonLink || '/shop',
      desktopImage,
      mobileImage,
      showBanner: rawData.showBanner === 'true' || rawData.showBanner === true,
      order: Number(rawData.order || 0)
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
});

// Admin: Delete Banner
router.delete('/admin/banners/:id', auth, async (req, res) => {
  try {
    const deleted = await db.banners.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});


// ==========================================
// 6. ANNOUNCEMENT ENDPOINTS
// ==========================================

// Get active announcements
router.get('/announcements', async (req, res) => {
  try {
    const list = await db.announcements.find({ isActive: true });
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// Admin: Get all announcements
router.get('/admin/announcements', auth, async (req, res) => {
  try {
    const list = await db.announcements.find({});
    list.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// Admin: Add Announcement
router.post('/admin/announcements', auth, async (req, res) => {
  try {
    const { content, order, isActive } = req.body;
    const newAnn = await db.announcements.create({
      content,
      order: Number(order || 0),
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true)
    });
    res.status(201).json(newAnn);
  } catch (error) {
    res.status(500).json({ message: 'Error adding announcement', error: error.message });
  }
});

// Admin: Edit Announcement
router.put('/admin/announcements/:id', auth, async (req, res) => {
  try {
    const { content, order, isActive } = req.body;
    const updated = await db.announcements.findByIdAndUpdate(req.params.id, {
      content,
      order: Number(order || 0),
      isActive: isActive === 'true' || isActive === true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

// Admin: Delete Announcement
router.delete('/admin/announcements/:id', auth, async (req, res) => {
  try {
    const deleted = await db.announcements.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});


// ==========================================
// 7. INQUIRY / CART ORDER ENDPOINTS
// ==========================================

// Public: Submit Cart Inquiry
router.post('/inquiries', async (req, res) => {
  const { customerDetails, items, totalAmount } = req.body;

  if (!customerDetails || !customerDetails.name || !customerDetails.phone || !items || items.length === 0) {
    return res.status(400).json({ message: 'Customer details (name, phone) and cart items are required' });
  }

  try {
    // Generate order number
    const inquiryNumber = `BTT-INQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newInquiry = await db.inquiries.create({
      inquiryNumber,
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        whatsapp: customerDetails.whatsapp || customerDetails.phone,
        email: customerDetails.email || '',
        city: customerDetails.city || '',
        address: customerDetails.address || '',
        message: customerDetails.message || ''
      },
      items: items.map(item => ({
        sareeId: item.sareeId,
        name: item.name,
        sku: item.sku,
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
        quantity: Number(item.quantity || 1),
        image: item.image || ''
      })),
      totalAmount: Number(totalAmount),
      status: 'New',
      internalNotes: ''
    });

    // Optional: Reduce inventory of items (sarees)
    for (const item of items) {
      const saree = await db.sarees.findById(item.sareeId);
      if (saree) {
        const currentQty = Number(saree.stockQty || 0);
        const newQty = Math.max(0, currentQty - Number(item.quantity));
        const newStatus = newQty === 0 ? 'out_of_stock' : saree.stockStatus;
        await db.sarees.findByIdAndUpdate(item.sareeId, { stockQty: newQty, stockStatus: newStatus });
      }
    }

    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting inquiry', error: error.message });
  }
});

// Public: Get single inquiry by ID
router.get('/inquiries/:id', async (req, res) => {
  try {
    const inquiry = await db.inquiries.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiry', error: error.message });
  }
});

// Admin: Get all inquiries
router.get('/admin/inquiries', auth, async (req, res) => {
  try {
    const list = await db.inquiries.find({});
    // Sort latest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
  }
});

// Admin: Edit Inquiry status & notes
router.put('/admin/inquiries/:id', auth, async (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await db.inquiries.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inquiry', error: error.message });
  }
});

// Admin: Get all registered customers (with inquiry count)
router.get('/admin/customers', auth, async (req, res) => {
  try {
    const customers = await db.customers.find({});
    const inquiries = await db.inquiries.find({});

    const list = customers.map(cust => {
      const count = inquiries.filter(inq => 
        inq.customerDetails.email && inq.customerDetails.email.toLowerCase() === cust.email.toLowerCase()
      ).length;
      
      // Destructure password out
      const { password, ...custDetails } = cust;
      return {
        ...custDetails,
        inquiriesCount: count
      };
    });

    // Sort latest registered first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customers list', error: error.message });
  }
});


// ==========================================
// 8. SHOP GLOBAL SETTINGS ENDPOINTS
// ==========================================

// Get Shop Settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await db.settings.findOne({});
    if (!settings) {
      // Seed default settings
      settings = await db.settings.create({
        shopName: 'Bani Thani Textiles',
        logoUrl: '',
        contactDetails: {
          address: 'Bani Thani Textiles, Ethnic Market, Jaipur, Rajasthan, India',
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
          title: 'Crafting Heritage Since Years',
          story: 'Bani Thani Textiles brings you the finest selection of handcrafted Indian sarees, directly from master artisans. Inspired by the classic Rajasthani Bani Thani miniature art form representing sheer elegance and traditional beauty, our sarees represent custom weaves, premium fabrics, and royal heritage designs.',
          features: [
            'Artisanal Craftsmanship: Hand-woven pieces from across India.',
            'Uncompromised Quality: Pure silks, organic cottons, and genuine work.',
            'Direct sourcing: Fair support for weaver communities.'
          ]
        },
        contactPageContent: {
          title: 'Visit Our Heritage Store',
          description: 'Step into Bani Thani Textiles store to experience luxury fabrics and traditional designs in person, or reach out to us for bulk orders and bridal appointments.'
        }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Admin: Update Shop Settings
router.put('/admin/settings', auth, upload.single('logo'), async (req, res) => {
  try {
    const rawData = req.body;
    let settings = await db.settings.findOne({});
    
    let logoUrl = settings ? settings.logoUrl : '';
    if (req.file) {
      logoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updateData = {
      shopName: rawData.shopName || 'Bani Thani Textiles',
      logoUrl,
      contactDetails: {
        address: rawData.address || '',
        phone: rawData.phone || '',
        whatsapp: rawData.whatsapp || '',
        email: rawData.email || ''
      },
      socialLinks: {
        facebook: rawData.facebook || '',
        instagram: rawData.instagram || '',
        pinterest: rawData.pinterest || ''
      },
      aboutPageContent: rawData.aboutPageContent ? JSON.parse(rawData.aboutPageContent) : (settings ? settings.aboutPageContent : {}),
      contactPageContent: rawData.contactPageContent ? JSON.parse(rawData.contactPageContent) : (settings ? settings.contactPageContent : {})
    };

    let updated;
    if (!settings) {
      updated = await db.settings.create(updateData);
    } else {
      updated = await db.settings.findByIdAndUpdate(settings._id, updateData);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

module.exports = router;
