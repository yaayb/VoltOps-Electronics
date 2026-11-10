# VoltOps Cloud ⚡

**Production-Grade Electronics Store Management SaaS & Omnichannel E-Commerce Platform**

VoltOps Cloud unites two synchronized workspaces backed by a single ACID-transactional SQLite / Prisma database inside a strictly typed TypeScript monorepo (`server/` + `client/`):

1. **Merchant SaaS Back-Office Console**: Live Recharts inventory valuation analytics, inline serialized SKU & stock management (automatically minting or retiring `IN_STOCK` serial units), Walk-In **In-Store POS Register Terminal**, Omnichannel Order Fulfillment (`STOREFRONT` & `POS`), **Serial / IMEI & Warranty Registry**, **RMA Hardware Repair Desk**, and Store & Promo Engine Configuration.
2. **Customer Electronics Storefront**: Studio obsidian/cyan design system (`#020617` / `#06B6D4`) with dark/light mode, technical category & silicon spec search, **Side-by-Side Hardware Spec Comparator**, wishlist, slide-over cart with live free-shipping progress bar, promo engine, and a **3-Step Validated Checkout** that atomically locks warehouse Serial/IMEI numbers and issues a printable Digital Warranty Certificate.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | Root `package.json` (`dev`, `build`, `seed`, `typecheck`, `db:push`) orchestrating `server/` and `client/` |
| **Backend (`server/`)** | Node.js, Express 4, TypeScript (`strict: true`), Prisma ORM, Zod, `bcryptjs`, `jsonwebtoken` (`httpOnly` cookies), `cors` |
| **Database** | SQLite (`file:./dev.db`) out of the box; PostgreSQL-ready via `DATABASE_URL` |
| **Frontend (`client/`)** | React 18, Vite 6, TypeScript (`strict: true`), Tailwind CSS, `@tanstack/react-query`, `recharts`, `lucide-react` |

---

## Quick Start & Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Push Prisma Schema & Seed Flagship Catalog
```bash
cd server
npx prisma db push
npm run seed
cd ..
```

### 3. Launch Full-Stack Development Servers (`server` on `:5000` + `client` on `:5173`)
```bash
npm run dev
```
- **Frontend App (Storefront + SaaS Console)**: http://localhost:5173
- **Backend REST API**: http://localhost:5000/api/health

---

## Seeded RBAC Accounts

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@voltops.io` | `Admin123!` | Full SaaS Console, Mint New SKUs, Inline Stock/Price Sync, POS, Orders, Serials, RMA Desk & Store Settings |
| **STAFF** | `staff@voltops.io` | `Staff123!` | Walk-In POS Register, Stock Adjustments, Order Fulfillment, Serial Lookup & RMA Repair Bench |
| **CUSTOMER** | `client@voltops.io` | `Client123!` | Customer Storefront, Wishlist, Side-by-Side Spec Comparator & 3-Step Serialized Checkout |

---

## Seeded Promotional Codes

| Code | Discount | Minimum Spend | Status |
| :--- | :--- | :--- | :--- |
| `TECH10` | **10% OFF** |Orders ≥ $300.00 | Active |
| `PRO50` | **$50.00 OFF** | Orders ≥ $500.00 | Active |

---

## Seeded Flagship Electronics Catalog (6 SKUs · 34 Serialized Units)

| SKU | Hardware Model | Category | Launch MSRP | Seeded Stock |
| :--- | :--- | :--- | :--- | :--- |
| `APL-MBP14-M4` | Apple MacBook Pro 14-inch (M4) | Laptops | $1,599.00 | 5 (`SN-APLMBP1-1001..1005`) |
| `SAM-S24U-256` | Samsung Galaxy S24 Ultra (256GB) | Smartphones | $1,299.99 | 6 (`SN-SAMS24U-1001..1006`) |
| `APL-IP16P-128` | Apple iPhone 16 Pro (128GB) | Smartphones | $999.00 | 8 (`SN-APLIP16-1001..1008`) |
| `APL-IPADP11-M4` | Apple 11-inch iPad Pro (M4, Wi-Fi) | Tablets | $999.00 | 3 (`SN-APLIPAD-1001..1003`) |
| `SNY-PS5S-1TB` | Sony PlayStation 5 Slim Console (1TB) | Gaming | $499.99 | 2 (`SN-SNYPS5S-1001..1002`) |
| `SNY-XM5-BLK` | Sony WH-1000XM5 Wireless Headphones | Audio | $399.99 | 10 (`SN-SNYXM5B-1001..1010`) |

---

## Verification & Production Build Commands

```bash
# Typecheck both server and client with strict mode
npm run typecheck

# Build production bundles for both server/ and client/
npm run build
```
