# FitStitch Boutique — Backend API (Phase 1)

Express + MongoDB REST API powering the FitStitch storefront and admin/operator dashboards.

## Stack

Node.js · Express · MongoDB (Mongoose) · JWT auth · Multer + Cloudinary · Nodemailer

## Getting Started

```bash
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Cloudinary + SMTP keys
npm run seed            # creates the first admin user + base categories/collections
npm run dev              # starts on http://localhost:5000
```

Login with the admin credentials from `.env` (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) at
`POST /api/auth/login`, then use products/banners endpoints from the admin dashboard to
populate the catalog (images upload straight to Cloudinary).

## Folder Structure

```
server.js
src/
  config/       db.js (Mongo connection), cloudinary.js (upload storage)
  models/       User, Product, Category, Collection, Order, Review,
                ContactEnquiry, BusinessPartner, Banner, Settings
  controllers/  business logic per resource
  routes/       Express routers per resource
  middleware/   auth.js (JWT protect + role authorize), errorHandler.js
  utils/        generateToken, sendEmail, slugify
  seed/         seed.js — initial admin + base data
```

## Auth & Roles

Two roles: `admin` and `operator`.

- **Admin**: full access — products, orders (status/delete), reviews, banners,
  categories, enquiries, business partner applications, user management, settings.
- **Operator**: can create/update products, upload product images, update
  discounts, manage collections, and update stock. Cannot delete products,
  manage orders' status, manage users, or access settings/enquiries/banners/reviews.

All protected routes require `Authorization: Bearer <token>` from
`POST /api/auth/login`.

## Key Endpoints

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/products | Public (filters: category, collection, q, featured, trending, newArrival, sort) |
| GET | /api/products/slug/:slug | Public |
| POST | /api/products | Admin/Operator (multipart, field `images`) |
| PUT | /api/products/:id | Admin/Operator |
| DELETE | /api/products/:id | Admin only |
| GET/POST | /api/collections | Public read / Admin+Operator write |
| POST | /api/orders | Public — logs a WhatsApp order before redirect |
| GET | /api/orders | Admin/Operator |
| PUT | /api/orders/:id/status | Admin only |
| GET/POST | /api/reviews | Public read / Admin write |
| POST | /api/enquiries/contact | Public |
| POST | /api/enquiries/business-partner | Public |
| GET/POST | /api/banners | Public read / Admin write |
| GET | /api/dashboard/summary | Admin/Operator |
| CRUD | /api/users | Admin only |

## Connecting the Storefront

In the storefront project, set `VITE_API_URL=http://localhost:5000/api` in its
`.env` — the existing `src/utils/api.js` and `src/data/products.js` calls are
already shaped to match these response formats; swap the mock imports for
`axios` calls to `/api/products`, `/api/reviews`, and `/api/banners`.

## Deployment

Works well on Render, Railway, or any Node host. Set all `.env` values as
environment variables in your host's dashboard, and point `CLIENT_URL` /
`ADMIN_CLIENT_URL` at your deployed frontend origins for CORS.
# FitStitch_Backend
