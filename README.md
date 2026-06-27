# 🛍️ NICA STORE — Full-Stack E-Commerce Platform

A professional full-stack e-commerce web application built with **Next.js 15**, featuring a complete shopping experience with M-Pesa and Cash on Delivery payment options.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17 or higher
- **npm** 9 or higher

### Installation & Setup

```bash
# 1. Clone / extract the project
cd nica-store

# 2. Install dependencies
npm install

# 3. Seed the database with sample data
npx tsx src/lib/seed.ts

# 4. Copy environment file
cp .env.example .env.local

# 5. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Demo Accounts

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@nicastore.co.ke     | admin123   |
| User  | jane@example.com          | admin123   |

> Click the **"Demo Accounts"** buttons on the login page to auto-fill credentials.

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles (Tailwind v4)
│   ├── not-found.tsx             # 404 page
│   ├── loading.tsx               # Loading skeleton
│   │
│   ├── shop/                     # Product catalog
│   │   ├── page.tsx              # Shop listing page
│   │   ├── ShopClient.tsx        # Client-side filters
│   │   ├── loading.tsx           # Shop skeleton loader
│   │   └── [id]/                 # Product detail
│   │       ├── page.tsx
│   │       └── ProductDetail.tsx
│   │
│   ├── cart/page.tsx             # Shopping cart
│   ├── checkout/page.tsx         # Checkout (delivery + payment)
│   ├── orders/page.tsx           # Order history
│   ├── account/page.tsx          # User account & wishlist
│   │
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in page
│   │   └── register/page.tsx     # Create account page
│   │
│   ├── admin/                    # Admin panel (admin role only)
│   │   ├── layout.tsx            # Admin layout with nav
│   │   ├── dashboard/page.tsx    # Dashboard with stats
│   │   ├── products/page.tsx     # Product CRUD
│   │   ├── orders/page.tsx       # Order management
│   │   └── users/page.tsx        # User management
│   │
│   └── api/                      # REST API routes
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── products/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PUT, DELETE
│       ├── orders/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PATCH
│       ├── payments/
│       │   └── mpesa/route.ts    # M-Pesa STK push simulation
│       └── admin/
│           └── users/route.ts    # Admin: list all users
│
├── components/
│   ├── auth/AuthProvider.tsx     # Session initializer
│   ├── layout/
│   │   ├── ConditionalLayout.tsx # Shows navbar/footer conditionally
│   │   ├── Navbar.tsx            # Main navigation
│   │   └── Footer.tsx            # Footer
│   └── shop/
│       └── ProductCard.tsx       # Reusable product card
│
├── lib/
│   ├── db.ts                     # File-based JSON database
│   ├── auth.ts                   # JWT & bcrypt utilities
│   ├── utils.ts                  # Helper functions
│   └── seed.ts                   # Database seeder
│
├── store/
│   └── index.ts                  # Zustand stores (cart, auth, wishlist)
│
├── types/
│   └── index.ts                  # TypeScript type definitions
│
└── data/                         # JSON database files (auto-created by seed)
    ├── users.json
    ├── products.json
    └── orders.json
```

---

## ✨ Features

### 👤 Customer Features
- **Browse & Search** — Filter by category, price, ratings, search by keyword
- **Product Details** — Images, description, stock status, related products
- **Shopping Cart** — Add/remove items, update quantities, persistent cart (localStorage)
- **Wishlist** — Save favourite products, view in account
- **Checkout** — Delivery address, M-Pesa or Cash on Delivery
- **Order Tracking** — View all orders with full status history
- **Account Management** — Profile editing, wishlist, security settings
- **User Registration** — Create account with password strength indicator

### ⚙️ Admin Features
- **Dashboard** — Revenue, order counts, low stock alerts, recent orders
- **Product Management** — Create, edit, delete, toggle visibility, stock management
- **Order Management** — View all orders, update order & payment status
- **User Management** — View all customers and admins

### 🔒 Security
- **JWT authentication** via HTTP-only cookies (7-day expiry)
- **bcrypt password hashing** (12 salt rounds)
- **Role-Based Access Control** (admin / user)
- **Route protection** — admin pages redirect unauthenticated users
- **API authorization** — all mutating endpoints validate JWT + role

### 💳 Payment Options
- **M-Pesa** — Simulated STK Push (swap with real Daraja API in production)
- **Cash on Delivery** — Pay when order arrives

---

## 🔧 Tech Stack

| Layer        | Technology               |
|--------------|--------------------------|
| Framework    | Next.js 15 (App Router)  |
| Language     | TypeScript               |
| Styling      | Tailwind CSS v4          |
| Auth         | JWT + bcrypt             |
| State        | Zustand (persist)        |
| Toasts       | react-hot-toast          |
| Icons        | Lucide React             |
| Database     | JSON files (file-based)  |
| Images       | Next.js Image (Unsplash) |

---

## 🌐 API Reference

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Create account    |
| POST   | /api/auth/login       | Sign in           |
| POST   | /api/auth/logout      | Sign out          |
| GET    | /api/auth/me          | Current user      |

### Products
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/products         | List (filter/sort/page)  |
| POST   | /api/products         | Create (admin only)      |
| GET    | /api/products/:id     | Get single product       |
| PUT    | /api/products/:id     | Update (admin only)      |
| DELETE | /api/products/:id     | Delete (admin only)      |

### Orders
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/orders           | List orders (own/all)    |
| POST   | /api/orders           | Place order              |
| GET    | /api/orders/:id       | Order detail             |
| PATCH  | /api/orders/:id       | Update status (admin)    |

### Payments
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/payments/mpesa       | Initiate M-Pesa payment  |

---

## 🔌 Real M-Pesa Integration

To connect to the real Safaricom Daraja API, replace `/src/app/api/payments/mpesa/route.ts` with:

```typescript
// 1. Get access token from Safaricom
const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
  headers: { Authorization: `Basic ${auth}` }
});
const { access_token } = await tokenRes.json();

// 2. Initiate STK Push
const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
  method: 'POST',
  headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    BusinessShortCode: MPESA_SHORTCODE,
    Password: Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64'),
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: order.total,
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: orderId,
    TransactionDesc: `NICA STORE Order ${orderId}`,
  })
});
```

Set the required env variables in `.env.local`:
```
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

---

## 🚀 Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

> **Important:** In production, replace the JSON file database with a real database (PostgreSQL, MongoDB, or Firestore) for scalability and concurrent access safety.

---

## 📸 Sample Data

The seeder creates:
- **2 users** (1 admin, 1 customer)
- **12 products** across 7 categories
- **1 sample order**

Re-run anytime: `npx tsx src/lib/seed.ts`

---

## 📄 License

© 2024 NICA STORE. Built for demonstration purposes.
