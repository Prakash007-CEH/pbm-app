# 🏗️ Prakash Building Material (PBM)
### Production-Ready Building Material Delivery App

---

## 📁 Project Structure

```
prakash-building-material/
├── public/
│   ├── index.html
│   └── manifest.json           ← PWA manifest
├── src/
│   ├── firebase/
│   │   └── config.js           ← Firebase init (reads .env)
│   ├── shared/
│   │   ├── hooks/
│   │   │   ├── useAuth.js      ← Auth context + hook
│   │   │   └── useCart.js      ← Cart context + hook
│   │   └── components/
│   │       └── ProtectedRoute.jsx
│   ├── customer/
│   │   ├── components/
│   │   │   ├── BottomNav.jsx
│   │   │   └── TransportNotice.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Home.jsx
│   │       ├── ProductList.jsx
│   │       ├── ProductDetail.jsx  ← Direct qty input + +/- buttons
│   │       ├── Cart.jsx           ← Transport selection + Continue btn
│   │       ├── Checkout.jsx       ← Place Order button
│   │       ├── Orders.jsx
│   │       ├── OrderDetail.jsx    ← Reorder + WhatsApp + Invoice
│   │       └── Profile.jsx
│   ├── admin/
│   │   ├── components/
│   │   │   └── AdminLayout.jsx   ← Sidebar + header
│   │   └── pages/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminOrders.jsx
│   │       ├── AdminOrderDetail.jsx  ← Full payment management
│   │       ├── AdminCustomers.jsx
│   │       └── AdminProducts.jsx
│   ├── utils/
│   │   └── products.js         ← All product data + constants
│   ├── styles/
│   │   └── global.css
│   ├── App.js                  ← All routes
│   └── index.js
├── scripts/
│   └── seedAdmin.js            ← Create first admin account
├── firestore.rules             ← Security rules
├── firestore.indexes.json
├── firebase.json               ← Hosting config
├── .env.example
└── package.json
```

---

## ✅ Validation Checklist — All Implemented

| Feature | Status | File |
|---------|--------|------|
| Back button — Product Detail | ✅ | `ProductDetail.jsx` |
| Back button — Cart | ✅ | `Cart.jsx` |
| Back button — Checkout | ✅ | `Checkout.jsx` |
| Back button — Orders | ✅ | `Orders.jsx` |
| Back button — Order Detail | ✅ | `OrderDetail.jsx` |
| Continue to Checkout button | ✅ | `Cart.jsx` (sticky, disabled until transport selected) |
| Place Order button | ✅ | `Checkout.jsx` (sticky, disabled until form+terms complete) |
| Direct quantity typing input | ✅ | `ProductDetail.jsx` + `Cart.jsx` |
| +/- quantity controls | ✅ | Both pages |
| Transport mandatory before checkout | ✅ | `Cart.jsx` (blocks button) |
| Order saved in Firestore | ✅ | `Checkout.jsx` → `orders` collection |
| Admin updates transport payment | ✅ | `AdminOrderDetail.jsx` — full Section 2 |
| Separate product + transport payments | ✅ | Two separate sections in admin |

---

## 🚀 Setup — Step by Step

### Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Enter name: `prakash-building-material`
3. Disable Google Analytics (optional) → Create

### Step 2: Enable Authentication

1. Firebase Console → **Authentication** → Get Started
2. **Sign-in method** → Enable **Email/Password**
3. Save

### Step 3: Create Firestore Database

1. Firebase Console → **Firestore Database** → Create database
2. Choose **Production mode** (we'll set rules later)
3. Choose region: `asia-south1` (Mumbai) — best for India
4. Done

### Step 4: Get Firebase Config

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → Click **`</>`** (Web)
3. App nickname: `PBM Web` → Register app
4. Copy the `firebaseConfig` object values

### Step 5: Configure Environment Variables

```bash
# In your project root, copy the example file:
cp .env.example .env

# Edit .env and fill in your actual values:
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# Your WhatsApp business number (with country code, no +):
REACT_APP_WHATSAPP_NUMBER=919876543210
```

### Step 6: Deploy Firestore Security Rules

Option A — Firebase CLI (recommended):
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # Select your project
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Option B — Firebase Console:
1. Go to Firestore → **Rules** tab
2. Paste contents of `firestore.rules`
3. Publish

### Step 7: Install and Run

```bash
npm install
npm start
```

App runs at: http://localhost:3000

---

## 👤 Create First Admin Account

```bash
# Install admin SDK dependencies:
npm install firebase-admin dotenv --save-dev

# Download serviceAccountKey.json:
# Firebase Console → Project Settings → Service Accounts
# → "Generate new private key" → Save as serviceAccountKey.json in project root
# ⚠️  NEVER commit serviceAccountKey.json to Git!

# Edit scripts/seedAdmin.js to set your admin email/password, then:
node scripts/seedAdmin.js
```

Admin login URL: `http://localhost:3000/admin/login`

---

## 🏗️ Firestore Collections

### `users`
```
{
  name: string,
  mobile: string,
  email: string,
  role: "customer" | "admin",
  createdAt: timestamp
}
```

### `admins`
```
{
  name: string,
  email: string,
  createdAt: timestamp
}
```

### `products`
```
{
  id: string,
  name: string,
  hindiName: string,
  category: string,
  price: number,
  unit: string,
  available: boolean,
  updatedAt: timestamp
}
```

### `orders`
```
{
  orderNumber: string,           // e.g., PBM2401051234
  customerId: string,            // Firebase Auth UID
  customerName: string,
  customerMobile: string,
  customerEmail: string,
  deliveryAddress: {
    address: string,
    landmark: string,
    city: string
  },
  note: string,
  items: [
    {
      id: string,
      name: string,
      price: number,
      unit: string,
      qty: number,
      subtotal: number
    }
  ],
  productTotal: number,
  transport: {
    type: string,
    name: string,
    hindiName: string
  },
  status: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled",
  productPayment: {
    amount: number,
    status: "pending" | "paid"
  },
  transportPayment: {
    amount: number | null,       // null = not yet confirmed by admin
    status: "unpaid" | "partial" | "paid",
    mode: "cash" | "upi" | "bank_transfer" | "other" | null,
    note: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🚀 Deploy to Production

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Netlify

```bash
npm run build
# Drag-drop the /build folder to netlify.com
# Or connect GitHub repo for auto-deploy
# Set publish directory: build
# Add all REACT_APP_* environment variables in Netlify dashboard
```

---

## 📱 Android Conversion (PWA)

The app is already PWA-ready with `manifest.json`.

### Option 1: PWA Builder (Easiest)
1. Deploy to Firebase/Netlify
2. Visit https://www.pwabuilder.com
3. Enter your app URL
4. Download Android package → upload to Play Store

### Option 2: Capacitor (Full Native Wrapper)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init "Prakash Building Material" "com.pbm.app"

# Build React app
npm run build

# Add Android platform
npx cap add android

# Sync
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
- Build → Generate Signed Bundle → APK
- Follow Play Store upload process

### capacitor.config.json (after npx cap init)
```json
{
  "appId": "com.pbm.buildingmaterial",
  "appName": "Prakash Building Material",
  "webDir": "build",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

---

## 🏪 Play Store Preparation

1. Create Google Play Developer account ($25 one-time fee)
2. Build signed APK/AAB in Android Studio
3. Required for Play Store submission:
   - App icon: 512x512 PNG (PBM logo)
   - Feature graphic: 1024x500 PNG
   - Screenshots: at least 2 phone screenshots
   - Privacy Policy URL (required — create simple one at privacypolicygenerator.info)
   - App description in English + Hindi
4. Submit for review (usually 1–3 days)

---

## 🔧 Customization

### Add New Product
Edit `src/utils/products.js` → add to `PRODUCTS` array.

### Change WhatsApp Number
Set `REACT_APP_WHATSAPP_NUMBER` in `.env`

### Change Theme Colors
Edit `src/styles/global.css` → CSS variables at top.

### Add Product Images
Store images in Firebase Storage or any CDN.
Add `imageUrl` field to products, display with `<img src={product.imageUrl} />`.

---

## 🛡️ Security Notes

1. **Never commit `.env`** — add to `.gitignore`
2. **Never commit `serviceAccountKey.json`**
3. Firestore rules prevent customers from reading other customers' orders
4. Admin access verified against `admins` collection and `role` field
5. Transport payment updates only possible by admin

---

## 📞 Support

WhatsApp button available on:
- Home page (header)
- Order Detail page

Set your business WhatsApp number in `.env` → `REACT_APP_WHATSAPP_NUMBER`
