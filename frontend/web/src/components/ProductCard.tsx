import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  stock?: number;
  lowStockThreshold?: number;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  category?: { name: string };
}

const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;
const getDiscount = (price: string, mrp: string) =>
  Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);

export function ProductCard({ product }: { product: ProductCardData }) {
  const onSale = Number(product.mrp) > Number(product.price);
  const image = product.images?.[0];
  const outOfStock = product.stock === 0;
  // Only shown when the stock figure really is at or below the product's own threshold
  const lowStock =
    !outOfStock &&
    product.stock !== undefined &&
    product.lowStockThreshold !== undefined &&
    product.stock <= product.lowStockThreshold;

  return (
    <Link href={`/products/${product.slug}`} className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary-100">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-secondary-300" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="badge bg-ink text-canvas">{getDiscount(product.price, product.mrp)}% off</span>
          )}
          {lowStock && <span className="badge bg-surface text-ink">Low stock</span>}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <span className="badge bg-surface text-ink">Out of stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.category?.name && <p className="eyebrow">{product.category.name}</p>}
        <h3 className="mt-1 truncate text-[15px] font-medium text-ink" title={product.name}>
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="price text-lg">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="text-sm tabular-nums text-secondary-400 line-through">
              <span className="sr-only">MRP </span>
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
