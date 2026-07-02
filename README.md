# Bani Thani Textiles — Premium Saree Catalog Website

A luxury, traditional Indian saree catalog website with cart-to-inquiry functionality, a detailed admin dashboard, and a zero-configuration local database.

Inspired by premium Indian ethnic fashion portals, this catalog lets customers browse sarees, view curated collections, filter by attributes, add sarees to their inquiry bag, and submit booking requests directly to the store owners on WhatsApp.

---

## 🌟 Core Features

### 🛍️ Public Saree Catalog
* **Dynamic Mega-Menu**: Real-time Categories (Silk, Banarasi, etc.) and Collections (Wedding, Festival) dropdowns managed from the admin panel.
* **Luxury Hero Slider**: Admin-manageable promotional banners with desktop/mobile adaptive layouts.
* **Product Catalog & Filters**: Slide-out filters for Category, Collection, Fabric, Color, Price, and marketing badges.
* **Product Detail Gallery**: Thumbnail image switcher, complete technical spec sheets, and cross-sell suggestions.
* **Inquiry Cart**: Select items, review totals, fill shipping inquiries, and submit without needing checkout payments.
* **WhatsApp Deep-Link**: Customer-initiated WhatsApp chat template containing invoice details, SKU, and catalog page URLs.
* **Recently Viewed List**: Stores local history to help buyers recall their favorite pieces.

### 🔐 Administrative Management Panel
* **Dashboard Stats**: Real-time counts of total sarees, low stock alerts, sales items, and new pending inquiries.
* **Saree Management (CRUD)**: Create, edit, and delete sarees, upload multiple product photos, set specifications, and set display filters.
* **Category Management (CRUD)**: Custom category titles, classification tags, and Navbar sorting/reordering.
* **Collection Management**: Create themed collections, set banners, and map individual sarees in bulk.
* **Marquee & Slider Management**: Configure sliding header announcements and hero banner sliders.
* **Inquiry Manager**: Status workflows (New ➜ Contacted ➜ Confirmed ➜ Completed), internal staff notes, direct click-to-chat WhatsApp links, and CSV export.
* **Global Settings**: Configure store logo, contact channels, social profiles, and editable page texts.

---

## 🛠️ Technology Stack
* **Frontend**: React.js (Vite), Tailwind CSS (Vanilla styling), Lucide Vector Icons.
* **Backend**: Node.js, Express.
* **Database**: Pure JavaScript file-based JSON store (zero-config database located in `backend/data/`).
* **Uploads**: Multer image parsing storing photos locally in `backend/uploads/`.

---

## 🚀 Setup & Running Guide

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Quick Start Development
To start both the frontend Vite development server and Express API simultaneously:
```bash
# 1. Install all dependencies (if not already done)
npm run install-all

# 2. Run the concurrent development servers
npm run dev
```
* **Public Catalog Website**: `http://localhost:5173`
* **Express API Server**: `http://localhost:5000`

### 3. Administrator Login Credentials
Access the admin portal by clicking the user icon in the top header navbar or visiting:
* **URL**: `http://localhost:5173/admin`
* **Default Username**: `admin`
* **Default Password**: `admin123`

*(You can update the default credentials directly inside `backend/.env` before starting the server, or use the settings panel to change the password once logged in.)*

### 4. Build for Production
To bundle Vite static assets and serve them directly from Express:
```bash
# 1. Build React frontend bundle
npm run build:frontend

# 2. Start the Express server in production
npm start
```
The application will be served completely on `http://localhost:5000` with the API and static React pages running together under a single port (ideal for final deployment).

---

## ☁️ Vercel Serverless Deployment

We have configured this monorepo to deploy seamlessly onto Vercel using the [vercel.json](file:///y:/priyanshu-web/vercel.json) configuration.

### ⚠️ Critical Serverless Notes (Persistence Constraints)
Vercel serverless functions run in ephemeral containers with a **read-only filesystem** (except for `/tmp`). 
* **Database Fallback**: We have configured the database to fall back to `/tmp/data` inside Vercel. While this prevents the app from crashing, **data will not persist** when Vercel recycles the container.
* **Image Uploads**: Any images uploaded by the admin are stored in `/tmp/uploads` temporarily and will be cleared when Vercel recycles the container.
* **For Permanent Production**:
  1. Add a `MONGO_URI` environment variable in Vercel to point to a remote MongoDB (like MongoDB Atlas) to persist products and inquiries.
  2. Integrate a cloud storage client (like Cloudinary or AWS S3) for product image uploads.

### 🚀 Deploying via Vercel CLI
Since the Vercel CLI is installed on this machine, you can run:
```bash
# 1. Start the interactive deployment setup
vercel

# 2. Complete the setup prompts:
#   - Set up and deploy? Yes
#   - Which scope? (Select your account)
#   - Link to existing project? No
#   - Project name? bani-thani-textiles
#   - Code directory? ./
#   - Modify default settings? No (Vercel automatically reads vercel.json)

# 3. Promote the preview to production
vercel --prod
```

---

## 📂 Project Structure
```
y:/priyanshu-web/
├── package.json                   # Orchestrates concurrent running of both systems
├── README.md                      # Setup and usage manuals
├── backend/
│   ├── data/                      # Local JSON database files (products.json, etc.)
│   ├── uploads/                   # Uploaded images (sarees, collections, banners)
│   ├── src/
│   │   ├── config/db.js           # JSON file-based database manager
│   │   ├── middleware/            # Auth JWT and Multer file upload middlewares
│   │   ├── routes/api.js          # API route definitions and controllers
│   │   └── server.js              # Express server entry point & seeder
│   └── package.json
└── frontend/
    ├── index.html                 # HTML frame & Google Fonts loading
    ├── vite.config.js             # Vite configurations with API/Uploads proxies
    ├── tailwind.config.js         # Theme color configurations
    └── src/
        ├── main.jsx               # Context providers injection
        ├── App.jsx                # Layout declarations and page router
        ├── index.css              # Custom scrollbars & gradient styling utilities
        ├── components/            # Reusable widgets (Navbar, Footer, ProductCard)
        ├── context/               # States for Auth, Cart, and Settings
        ├── pages/                 # Catalog pages (Home, Shop, Details, Cart, etc.)
        └── admin/                 # Administration control boards
```

---

## 🎨 Styling Accents
* **Background Cream**: `#FAF6F0` (warm heritage feel)
* **Accent Gold**: `#D4AF37` (royal metallic gold borders & tags)
* **Brand Maroon**: `#580F17` (deep ethnic fashion theme buttons & headers)
* **Font Family**: Cormorant Garamond / Playfair Display (Luxury Serif Headings) & Outfit (Geometric Sans-serif body)
"# priyanshu-web" 
