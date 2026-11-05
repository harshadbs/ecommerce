# E-Commerce Platform

A full-featured Indian e-commerce platform with customer-facing website, admin panel, and robust REST API.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Payment**: Razorpay (to be integrated)
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
ecommerce/
├── apps/
│   ├── web/          # Customer website (Next.js) - port 3000
│   └── admin/        # Admin panel (Next.js) - port 3001
├── packages/
│   ├── api/          # Backend API (Express) - port 4000
│   └── shared/       # Shared types, constants, utils
└── package.json      # Root package.json
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)

## Getting Started

### 1. Install dependencies

```bash
cd ecommerce
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Set JWT secrets (generate secure random strings)

### 3. Set up the database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Or run migrations (production)
pnpm db:migrate

# Seed initial data
pnpm --filter api db:seed
```

### 4. Start development servers

```bash
# Start all apps in development mode
pnpm dev

# Or start individual apps
pnpm --filter api dev      # API on http://localhost:4000
pnpm --filter web dev      # Web on http://localhost:3000
pnpm --filter admin dev    # Admin on http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password (auth required)

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile

### Addresses
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create address
- `GET /api/addresses/:id` - Get address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PATCH /api/addresses/:id/default` - Set as default

## Default Admin Credentials

After seeding the database:
- **Email**: admin@ecommerce.com
- **Password**: Admin@123

## Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm lint             # Lint all apps

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
```

## Database Tables

All tables use the `tbl_` prefix:

| Table | Description |
|-------|-------------|
| `tbl_users` | User accounts |
| `tbl_refresh_tokens` | JWT refresh tokens |
| `tbl_addresses` | User addresses |
| `tbl_categories` | Product categories |
| `tbl_products` | Product catalog |
| `tbl_product_images` | Product images |
| `tbl_product_variants` | Product variants |
| `tbl_carts` | Shopping carts |
| `tbl_cart_items` | Cart items |
| `tbl_wishlists` | User wishlists |
| `tbl_orders` | Orders |
| `tbl_order_items` | Order line items |
| `tbl_order_status_history` | Order status tracking |
| `tbl_payments` | Payment records |
| `tbl_coupons` | Discount coupons |
| `tbl_coupon_usages` | Coupon usage tracking |
| `tbl_reviews` | Product reviews |
| `tbl_audit_logs` | Admin audit logs |

## Development Phases

- [x] **Phase 1**: Foundation (Auth, Users, Addresses)
- [ ] **Phase 2**: Catalog (Categories, Products, Search)
- [ ] **Phase 3**: Shopping (Cart, Wishlist, Checkout)
- [ ] **Phase 4**: Payments & Orders (Razorpay, Order tracking)
- [ ] **Phase 5**: Admin Panel (Dashboard, Management)
- [ ] **Phase 6**: Production (SEO, Performance, Security)

## License

Private - All rights reserved
