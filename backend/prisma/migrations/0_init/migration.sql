-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "tbl_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_products" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_desc" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "sku" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "meta_title" TEXT,
    "meta_desc" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_wishlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "coupon_id" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "order_status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "tbl_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'razorpay',
    "gateway_order_id" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_signature" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "refund_amount" DECIMAL(10,2),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_value" DECIMAL(10,2),
    "max_discount" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_coupon_usages" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_email_key" ON "tbl_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_phone_key" ON "tbl_users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_refresh_tokens_token_key" ON "tbl_refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "tbl_refresh_tokens_user_id_idx" ON "tbl_refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "tbl_addresses_user_id_idx" ON "tbl_addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_categories_slug_key" ON "tbl_categories"("slug");

-- CreateIndex
CREATE INDEX "tbl_categories_parent_id_idx" ON "tbl_categories"("parent_id");

-- CreateIndex
CREATE INDEX "tbl_categories_slug_idx" ON "tbl_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_products_slug_key" ON "tbl_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_products_sku_key" ON "tbl_products"("sku");

-- CreateIndex
CREATE INDEX "tbl_products_category_id_idx" ON "tbl_products"("category_id");

-- CreateIndex
CREATE INDEX "tbl_products_status_idx" ON "tbl_products"("status");

-- CreateIndex
CREATE INDEX "tbl_products_slug_idx" ON "tbl_products"("slug");

-- CreateIndex
CREATE INDEX "tbl_product_images_product_id_idx" ON "tbl_product_images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_product_variants_sku_key" ON "tbl_product_variants"("sku");

-- CreateIndex
CREATE INDEX "tbl_product_variants_product_id_idx" ON "tbl_product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_carts_user_id_key" ON "tbl_carts"("user_id");

-- CreateIndex
CREATE INDEX "tbl_cart_items_cart_id_idx" ON "tbl_cart_items"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_cart_items_cart_id_product_id_variant_id_key" ON "tbl_cart_items"("cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE INDEX "tbl_wishlists_user_id_idx" ON "tbl_wishlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_wishlists_user_id_product_id_key" ON "tbl_wishlists"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_orders_order_number_key" ON "tbl_orders"("order_number");

-- CreateIndex
CREATE INDEX "tbl_orders_user_id_idx" ON "tbl_orders"("user_id");

-- CreateIndex
CREATE INDEX "tbl_orders_order_status_idx" ON "tbl_orders"("order_status");

-- CreateIndex
CREATE INDEX "tbl_orders_order_number_idx" ON "tbl_orders"("order_number");

-- CreateIndex
CREATE INDEX "tbl_order_items_order_id_idx" ON "tbl_order_items"("order_id");

-- CreateIndex
CREATE INDEX "tbl_order_status_history_order_id_idx" ON "tbl_order_status_history"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_payments_order_id_key" ON "tbl_payments"("order_id");

-- CreateIndex
CREATE INDEX "tbl_payments_gateway_order_id_idx" ON "tbl_payments"("gateway_order_id");

-- CreateIndex
CREATE INDEX "tbl_payments_gateway_payment_id_idx" ON "tbl_payments"("gateway_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_coupons_code_key" ON "tbl_coupons"("code");

-- CreateIndex
CREATE INDEX "tbl_coupons_code_idx" ON "tbl_coupons"("code");

-- CreateIndex
CREATE INDEX "tbl_coupon_usages_user_id_idx" ON "tbl_coupon_usages"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_coupon_usages_coupon_id_user_id_key" ON "tbl_coupon_usages"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "tbl_reviews_product_id_idx" ON "tbl_reviews"("product_id");

-- CreateIndex
CREATE INDEX "tbl_reviews_is_approved_idx" ON "tbl_reviews"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_reviews_user_id_product_id_key" ON "tbl_reviews"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "tbl_audit_logs_user_id_idx" ON "tbl_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "tbl_audit_logs_entity_type_entity_id_idx" ON "tbl_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "tbl_audit_logs_created_at_idx" ON "tbl_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "tbl_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_addresses" ADD CONSTRAINT "tbl_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_categories" ADD CONSTRAINT "tbl_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tbl_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_products" ADD CONSTRAINT "tbl_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tbl_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_product_images" ADD CONSTRAINT "tbl_product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_product_variants" ADD CONSTRAINT "tbl_product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_carts" ADD CONSTRAINT "tbl_carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cart_items" ADD CONSTRAINT "tbl_cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "tbl_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cart_items" ADD CONSTRAINT "tbl_cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_cart_items" ADD CONSTRAINT "tbl_cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "tbl_product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_wishlists" ADD CONSTRAINT "tbl_wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_wishlists" ADD CONSTRAINT "tbl_wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_orders" ADD CONSTRAINT "tbl_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_orders" ADD CONSTRAINT "tbl_orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "tbl_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_orders" ADD CONSTRAINT "tbl_orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "tbl_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tbl_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "tbl_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_order_items" ADD CONSTRAINT "tbl_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "tbl_product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_order_status_history" ADD CONSTRAINT "tbl_order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tbl_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_payments" ADD CONSTRAINT "tbl_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "tbl_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_coupon_usages" ADD CONSTRAINT "tbl_coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "tbl_coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_coupon_usages" ADD CONSTRAINT "tbl_coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_reviews" ADD CONSTRAINT "tbl_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_reviews" ADD CONSTRAINT "tbl_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "tbl_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

