const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers for SRV record resolution (only locally)
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    console.warn('Warning: Could not set DNS servers. Connection to Mongo SRV might fail.', e);
  }
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(__dirname, '../../data');

// Create database folder if it doesn't exist (for JSON fallback)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// A. JSON File-Based Database Implementation
// ==========================================

class JSONCollection {
  constructor(name) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
  }

  async read() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
      }
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (error) {
      console.error(`Error reading database file ${this.filePath}:`, error);
      return [];
    }
  }

  async write(data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing database file ${this.filePath}:`, error);
    }
  }

  async find(query = {}) {
    const items = await this.read();
    return items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = await this.read();
    return items.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const items = await this.read();
    const newItem = {
      _id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deletedItem = items[index];
    items.splice(index, 1);
    await this.write(items);
    return deletedItem;
  }

  async deleteMany(query = {}) {
    const items = await this.read();
    const remaining = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return true;
        }
      }
      return false;
    });
    await this.write(remaining);
    return true;
  }
}

// ==========================================
// B. MongoDB Mongoose Database Implementation
// ==========================================

class MongoCollection {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}) {
    return this.model.find(query).lean();
  }

  async findOne(query = {}) {
    return this.model.findOne(query).lean();
  }

  async findById(id) {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.model.findById(id).lean();
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async findByIdAndUpdate(id, updateData) {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async findByIdAndDelete(id) {
    if (typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.model.findByIdAndDelete(id).lean();
  }

  async deleteMany(query = {}) {
    await this.model.deleteMany(query);
    return true;
  }
}

// Define Schemas
const SareeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  discountPercentage: { type: Number, default: 0 },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  collection: { type: String, default: '' },
  description: { type: String, default: '' },
  fabric: { type: String, default: '' },
  color: { type: String, default: '' },
  length: { type: String, default: '5.5 Meters' },
  blousePiece: { type: Boolean, default: true },
  workType: { type: String, default: '' },
  occasion: { type: String, default: '' },
  washCare: { type: String, default: 'Dry Clean Only' },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  stockStatus: { type: String, default: 'in_stock' },
  stockQty: { type: Number, default: 1 },
  isVisible: { type: Boolean, default: true },
  images: [String]
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subcategories: [String],
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CollectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  sarees: [String],
  showOnHome: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const BannerSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  desktopImage: { type: String, default: '' },
  mobileImage: { type: String, default: '' },
  showBanner: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const AnnouncementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const InquirySchema = new mongoose.Schema({
  inquiryNumber: { type: String, required: true },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    message: { type: String, default: '' }
  },
  items: [{
    sareeId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    quantity: { type: Number, default: 1 },
    image: { type: String, default: '' }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'New' },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  shopName: { type: String, default: 'Bani Thani Textiles' },
  logoUrl: { type: String, default: '' },
  contactDetails: {
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    pinterest: { type: String, default: '' }
  },
  aboutPageContent: {
    title: { type: String, default: '' },
    story: { type: String, default: '' },
    features: [String]
  },
  contactPageContent: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

// ==========================================
// C. Export & Dynamic Connection Init
// ==========================================

let db;

if (process.env.MONGO_URI) {
  console.log('MongoDB connection URI detected. Connecting...');
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => {
      console.error('Error connecting to MongoDB. Check MONGO_URI in .env.', err);
    });

  // Compile Mongoose models
  const Saree = mongoose.models.Saree || mongoose.model('Saree', SareeSchema);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
  const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
  const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
  const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
  const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

  db = {
    sarees: new MongoCollection(Saree),
    categories: new MongoCollection(Category),
    collections: new MongoCollection(Collection),
    banners: new MongoCollection(Banner),
    announcements: new MongoCollection(Announcement),
    inquiries: new MongoCollection(Inquiry),
    settings: new MongoCollection(Settings),
    users: new MongoCollection(User),
    customers: new MongoCollection(Customer)
  };
} else {
  console.log('No MongoDB connection URI detected. Running on local JSON files.');
  db = {
    sarees: new JSONCollection('sarees'),
    categories: new JSONCollection('categories'),
    collections: new JSONCollection('collections'),
    banners: new JSONCollection('banners'),
    announcements: new JSONCollection('announcements'),
    inquiries: new JSONCollection('inquiries'),
    settings: new JSONCollection('settings'),
    users: new JSONCollection('users'),
    customers: new JSONCollection('customers')
  };
}

module.exports = db;
