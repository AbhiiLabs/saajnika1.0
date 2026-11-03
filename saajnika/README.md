# SAAJNIKA — Digital Fashion Boutique Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=flat&logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

**SAAJNIKA** is an independent, production-grade Direct-to-Consumer (D2C) women's luxury fashion e-commerce platform. Designed with high-fashion editorial restraint, an asymmetrical magazine aesthetic, and robust server-authoritative architecture.

---

## 💎 Design Direction & First 5 Seconds

Unlike cluttered e-commerce marketplaces (Myntra, AJIO, Amazon), **SAAJNIKA** is crafted as an intimate digital boutique:
* **Typography Hierarchy**: Cormorant Garamond display serif paired with tracked Plus Jakarta Sans body typography.
* **Warm Editorial Palette**: Alabaster ivory (`#FAF8F5`), charcoal black (`#1A1817`), soft sand (`#ECE7DF`), and muted terracotta rose (`#966355`).
* **First 5 Seconds Impact**: High-fashion asymmetrical hero featuring the *Winter Solstice* collection, real handloom fabric provenance labels, and floating lookbook previews.
* **No AI Slop**: Zero neon gradients, zero generic pill badges, zero drop shadows.

---

## 🏛️ System Architecture

```
[ Client Browser (React + Vite + TypeScript) ]
                     │  (HTTP / JWT Auth / REST API)
                     ▼
             [ Nginx Reverse Proxy ]
                     │
    ┌────────────────┴────────────────┐
    ▼                                 ▼
[ Frontend SPA (Port 80) ]   [ Django DRF Backend (Port 8000) ]
                                      │
                 ┌────────────────────┼───────────────────┐
                 ▼                    ▼                   ▼
       [ PostgreSQL (Port 5432) ]  [ Redis (Port 6379) ]  [ Razorpay / Shiprocket ]
                                      │
                             [ Celery Worker & Beat ]
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Set Up Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed luxury editorial catalog, categories, banners & test users
python manage.py seed_data

# Start backend server
python manage.py runserver 127.0.0.1:8000
```

### 2. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (with built-in proxy to port 8000)
npm run dev
```

Visit **http://127.0.0.1:5173/** in your browser.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Atelier Admin** | `admin@saajnika.com` | `SaajnikaAdmin2025!` | Full access to `/admin` dashboard, catalog CRUD, orders, inventory & CMS |
| **Private Client** | `client@saajnika.com` | `CustomerPass2025!` | Customer account, saved addresses, wishlist, order history |

---

## 🛠️ Complete Feature Matrix

### Customer-Facing Storefront
1. **Editorial Homepage**: Hero campaign, Curated Chapters, New Season Arrivals, Atelier Manifesto storytelling, and client guarantees.
2. **Collection Catalog (`/shop`)**: Multi-faceted filtering (Category, Size, Color, Price), search, and ordering.
3. **Product Detail Page (`/product/:slug`)**: High-res portrait gallery, color & size variant selection with live stock count, pincode courier check, accordion care notes, and related silhouettes.
4. **Interactive Bag Drawer**: Live free courier progress towards ₹3,999, coupon application, and quantity adjustments.
5. **Multi-Step Checkout (`/checkout`)**: Address selection/creation, order summary, server-authoritative discount validation, and Razorpay payment flow.
6. **Live Order Tracking (`/orders/track`)**: Chronological status timeline, shipment information, address snapshot, and order cancellation.
7. **Curated Wishlist (`/wishlist`)**: Real-time favorite toggling for authenticated and guest users.
8. **Client Account (`/account`)**: Order history, saved address management, and profile info.

### Dedicated Atelier Admin Panel (`/admin`)
1. **Executive Dashboard**: Real database metrics (revenue, orders, inventory alerts) with **Recharts** area & bar charts.
2. **Silhouette Management (`/admin/products`)**: Create, edit, and configure products, variants, SKU codes, and stock.
3. **Order Fulfillment (`/admin/orders`)**: Real-time order pipeline management, valid state transitions (`PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED`), and audit logging.
4. **Inventory & Stock Control (`/admin/inventory`)**: Variant-level stock adjustments with mandatory audit reason logging.
5. **Coupons & Privileges (`/admin/coupons`)**: Percentage and fixed discount coupon generator with minimum order rules.
6. **Banners & CMS (`/admin/cms`)**: Live editor for homepage hero banners, announcement bar, and boutique settings.

---

## 🐳 Docker Deployment

To launch the complete production stack (Nginx, Frontend, Backend, PostgreSQL, Redis, Celery):

```bash
cp .env.example .env
docker-compose up --build -d
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test apps.catalog.tests apps.orders.tests
```

### Frontend Build Validation
```bash
cd frontend
npm run build
```

---

## 📜 License & Provenance

© 2025 SAAJNIKA ATELIER PVT. LTD. All rights reserved. Commercial fashion brand platform.
